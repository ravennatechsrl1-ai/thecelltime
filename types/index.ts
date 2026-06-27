export type ProductCategory = "phones" | "accessories" | "other" | "protection";

export type ProductCondition = string | null;

export type ProductNameI18n = Partial<Record<"it" | "en", string>>;

export interface Product {
  id: string;
  name: string;
  name_i18n?: ProductNameI18n | null;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  brand: string;
  image_url: string;
  stock: number;
  /** Percentage off the listed price (e.g. 20 = 20% off). Null = no promotion. */
  promotion_percent: number | null;
  protection_device_type?: string | null;
  protection_brand_slug?: string | null;
  protection_model_slug?: string | null;
  protection_series?: string | null;
  protection_subtype?: string | null;
  accessory_device_type?: string | null;
  accessory_brand_slug?: string | null;
  accessory_model_slug?: string | null;
  accessory_series?: string | null;
  accessory_subtype?: string | null;
  /** Phone storage label (e.g. 128GB) */
  storage?: string | null;
  /** Phone color label (e.g. Black) */
  color?: string | null;
  /** When true, hidden from the public shop but kept in admin and database. */
  frozen: boolean;
  /** Parent phone listing (one card in shop) */
  phone_listing_id?: string | null;
  /** Denormalized listing title without storage/color */
  phone_listing_base_name?: string | null;
  phone_listing_base_name_i18n?: ProductNameI18n | null;
}

export type RepairTicketStatus =
  | "Ricevuto"
  | "In Diagnostica"
  | "In Riparazione"
  | "Pronto al Ritiro";

export interface RepairTicket {
  id: string;
  ticket_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  device_brand: string;
  device_model: string;
  issue: string;
  estimated_price: number;
  status: RepairTicketStatus;
  created_at: string;
  updated_at: string;
}

export interface RepairBookingPayload {
  deviceBrand: string;
  deviceModel: string;
  issue: string;
  estimatedPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutCustomerData {
  name: string;
  email: string;
  phone?: string;
}

export interface ShippingAddress {
  country: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface CheckoutPrepareBody {
  paymentIntentId: string;
  lineItems: CheckoutLineItem[];
  totalAmount: number;
  customer: CheckoutCustomerData;
  shippingAddress: ShippingAddress;
}

export interface CheckoutLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CheckoutRequestBody {
  lineItems: CheckoutLineItem[];
  totalAmount: number;
  customer: CheckoutCustomerData;
}

export type ShopFilter =
  | "all"
  | "phones-new"
  | "phones-used"
  | "accessories";

export interface DeviceOption {
  brand: string;
  models: string[];
}

export interface RepairIssue {
  id: string;
  label: string;
  basePrice: number;
}

export interface AdminProductPayload {
  name: string;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  stock: number;
  brand: string;
  imageUrl: string;
  protection_device_type?: string | null;
  protection_brand_slug?: string | null;
  protection_model_slug?: string | null;
  protection_series?: string | null;
  protection_subtype?: string | null;
  accessory_device_type?: string | null;
  accessory_brand_slug?: string | null;
  accessory_model_slug?: string | null;
  accessory_series?: string | null;
  accessory_subtype?: string | null;
}

export interface ApiErrorResponse {
  error: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface RepairBookingResponse {
  ticketId: string;
}

export interface TrackTicketResponse {
  ticket: RepairTicket;
}

export interface AdminAuthRequest {
  password: string;
}

export interface AdminAuthResponse {
  authenticated: boolean;
}

export interface AdminTicketUpdatePayload {
  ticketId: string;
  status: RepairTicketStatus;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ShopOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id?: string | null;
  shipping_address?: ShippingAddress | null;
  delivered_at?: string | null;
  updated_at?: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface AdminOrderUpdatePayload {
  status: OrderStatus;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface AdminCustomer {
  email: string;
  name: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
}

export interface SalesDayPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopSoldProduct {
  product_id: string | null;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingFulfillmentCount: number;
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCustomers: number;
  registeredUsers: number;
  activeRepairs: number;
  phonesInCatalog: number;
  accessoriesInCatalog: number;
  promotedProductsCount: number;
  revenueToday: number;
  ordersToday: number;
  averageOrderValue: number;
  salesByDay: SalesDayPoint[];
  topProducts: TopSoldProduct[];
  recentOrders: ShopOrder[];
  lowStockProducts: Product[];
}
