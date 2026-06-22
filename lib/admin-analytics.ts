import { AdminDashboardStats, Product, ShopOrder, ShippingAddress } from "@/types";
import { mapProductRow } from "@/lib/map-product";
import { isOnPromotion } from "@/lib/product-pricing";
import { PENDING_FULFILLMENT_STATUSES, REVENUE_ORDER_STATUSES } from "@/lib/order-status";
import { getSupabaseClientSafe } from "@/utils/supabase";

const LOW_STOCK_THRESHOLD = 5;

function mapProduct(row: Record<string, unknown>): Product {
  return mapProductRow(row);
}

function mapOrder(row: Record<string, unknown>): ShopOrder {
  const shippingRaw = row.shipping_address;
  let shipping_address: ShippingAddress | null = null;
  if (shippingRaw && typeof shippingRaw === "object" && !Array.isArray(shippingRaw)) {
    shipping_address = shippingRaw as ShippingAddress;
  }

  return {
    id: row.id as string,
    order_number: row.order_number as string,
    customer_name: row.customer_name as string,
    customer_email: row.customer_email as string,
    customer_phone: (row.customer_phone as string | null) ?? null,
    total_amount: Number(row.total_amount),
    status: row.status as ShopOrder["status"],
    stripe_session_id: (row.stripe_session_id as string | null) ?? null,
    stripe_payment_intent_id:
      (row.stripe_payment_intent_id as string | null) ?? null,
    shipping_address,
    delivered_at: (row.delivered_at as string | null) ?? null,
    updated_at: (row.updated_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const empty: AdminDashboardStats = {
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalProducts: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalCustomers: 0,
    registeredUsers: 0,
    activeRepairs: 0,
    phonesInCatalog: 0,
    accessoriesInCatalog: 0,
    promotedProductsCount: 0,
    revenueToday: 0,
    ordersToday: 0,
    averageOrderValue: 0,
    pendingFulfillmentCount: 0,
    salesByDay: last7Days().map((date) => ({
      date,
      label: dayLabel(date),
      revenue: 0,
      orders: 0,
    })),
    topProducts: [],
    recentOrders: [],
    lowStockProducts: [],
  };

  const supabase = getSupabaseClientSafe();
  if (!supabase) return empty;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    productsRes,
    ordersRes,
    orderItemsRes,
    ticketsRes,
    usersRes,
    recentOrdersRes,
  ] = await Promise.all([
    supabase.from("products").select("*"),
    supabase
      .from("shop_orders")
      .select("*")
      .in("status", REVENUE_ORDER_STATUSES),
    supabase.from("shop_order_items").select("*"),
    supabase.from("repair_tickets").select("status"),
    supabase.from("shop_users").select("email"),
    supabase
      .from("shop_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (productsRes.error) {
    console.error("[admin/stats] products", productsRes.error);
  }

  const products = (productsRes.data ?? []).map(mapProduct);
  const paidOrders = (ordersRes.data ?? []).map(mapOrder);
  const orderItems = orderItemsRes.data ?? [];
  const recentOrders = (recentOrdersRes.data ?? []).map(mapOrder);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const customerEmails = new Set(
    paidOrders.map((order) => order.customer_email.toLowerCase())
  );

  const salesByDayMap = new Map(
    last7Days().map((date) => [date, { revenue: 0, orders: 0 }])
  );

  for (const order of paidOrders) {
    const day = order.created_at.slice(0, 10);
    if (salesByDayMap.has(day)) {
      const entry = salesByDayMap.get(day)!;
      entry.revenue += order.total_amount;
      entry.orders += 1;
    }
  }

  const topMap = new Map<
    string,
    { product_id: string | null; product_name: string; quantity_sold: number; revenue: number }
  >();

  for (const item of orderItems) {
    const key = (item.product_id as string | null) ?? item.product_name;
    const existing = topMap.get(key) ?? {
      product_id: (item.product_id as string | null) ?? null,
      product_name: item.product_name as string,
      quantity_sold: 0,
      revenue: 0,
    };
    existing.quantity_sold += Number(item.quantity);
    existing.revenue += Number(item.quantity) * Number(item.unit_price);
    topMap.set(key, existing);
  }

  const ordersToday = paidOrders.filter(
    (order) => order.created_at >= todayIso
  );
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total_amount, 0);

  const activeRepairs = (ticketsRes.data ?? []).filter(
    (ticket) => ticket.status !== "Pronto al Ritiro"
  ).length;

  const pendingFulfillmentCount = paidOrders.filter((order) =>
    PENDING_FULFILLMENT_STATUSES.includes(order.status)
  ).length;

  return {
    totalRevenue,
    totalOrders: paidOrders.length,
    paidOrders: paidOrders.length,
    pendingFulfillmentCount,
    totalProducts: products.length,
    totalStockUnits,
    lowStockCount: lowStockProducts.length,
    outOfStockCount,
    totalCustomers: customerEmails.size,
    registeredUsers: usersRes.data?.length ?? 0,
    activeRepairs,
    phonesInCatalog: products.filter((p) => p.category === "phones").length,
    accessoriesInCatalog: products.filter((p) => p.category === "accessories")
      .length,
    promotedProductsCount: products.filter((p) => isOnPromotion(p)).length,
    revenueToday,
    ordersToday: ordersToday.length,
    averageOrderValue:
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
    salesByDay: last7Days().map((date) => ({
      date,
      label: dayLabel(date),
      revenue: salesByDayMap.get(date)?.revenue ?? 0,
      orders: salesByDayMap.get(date)?.orders ?? 0,
    })),
    topProducts: [...topMap.values()]
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 6),
    recentOrders,
    lowStockProducts: lowStockProducts.slice(0, 6),
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*, phone_listings(base_name, base_name_i18n)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapProduct);
}

export async function fetchAllOrders(options?: {
  search?: string;
}): Promise<ShopOrder[]> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  let query = supabase.from("shop_orders").select("*").order("created_at", {
    ascending: false,
  });

  const search = options?.search?.trim();
  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `order_number.ilike.${term},customer_email.ilike.${term},customer_name.ilike.${term}`
    );
  }

  const { data: orders, error } = await query;

  if (error || !orders) return [];

  const { data: items } = await supabase.from("shop_order_items").select("*");

  const itemsByOrder = new Map<string, ShopOrder["items"]>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id as string) ?? [];
    list.push({
      id: item.id as string,
      order_id: item.order_id as string,
      product_id: (item.product_id as string | null) ?? null,
      product_name: item.product_name as string,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    });
    itemsByOrder.set(item.order_id as string, list);
  }

  return orders.map((row) => ({
    ...mapOrder(row),
    items: itemsByOrder.get(row.id as string) ?? [],
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: ShopOrder["status"]
): Promise<ShopOrder | null> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return null;

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "delivered") {
    patch.delivered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("shop_orders")
    .update(patch)
    .eq("id", orderId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[admin/orders] update", error);
    return null;
  }

  const order = mapOrder(data);

  const { data: items } = await supabase
    .from("shop_order_items")
    .select("*")
    .eq("order_id", orderId);

  return {
    ...order,
    items: (items ?? []).map((item) => ({
      id: item.id as string,
      order_id: item.order_id as string,
      product_id: (item.product_id as string | null) ?? null,
      product_name: item.product_name as string,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })),
  };
}

export async function fetchAdminCustomers() {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return [];

  const { data: orders } = await supabase
    .from("shop_orders")
    .select("customer_name, customer_email, total_amount, status, created_at")
    .eq("status", "paid");

  const map = new Map<
    string,
    {
      email: string;
      name: string;
      orders_count: number;
      total_spent: number;
      last_order_at: string | null;
    }
  >();

  for (const order of orders ?? []) {
    const email = (order.customer_email as string).toLowerCase();
    const existing = map.get(email) ?? {
      email: order.customer_email as string,
      name: order.customer_name as string,
      orders_count: 0,
      total_spent: 0,
      last_order_at: null,
    };
    existing.orders_count += 1;
    existing.total_spent += Number(order.total_amount);
    const createdAt = order.created_at as string;
    if (!existing.last_order_at || createdAt > existing.last_order_at) {
      existing.last_order_at = createdAt;
      existing.name = order.customer_name as string;
    }
    map.set(email, existing);
  }

  const { data: users } = await supabase
    .from("shop_users")
    .select("email, full_name, created_at");

  for (const user of users ?? []) {
    const email = (user.email as string).toLowerCase();
    if (!map.has(email)) {
      map.set(email, {
        email: user.email as string,
        name: (user.full_name as string) || (user.email as string),
        orders_count: 0,
        total_spent: 0,
        last_order_at: null,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.total_spent - a.total_spent);
}

export function generateOrderNumber(): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TCT-${stamp}-${rand}`;
}
