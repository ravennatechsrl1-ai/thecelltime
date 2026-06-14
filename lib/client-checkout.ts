import { User } from "@supabase/supabase-js";
import { CheckoutCustomerData, CheckoutRequestBody } from "@/types";

export function getCheckoutCustomer(user: User | null): CheckoutCustomerData {
  if (user?.email) {
    const meta = user.user_metadata ?? {};
    const name =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      user.email.split("@")[0] ||
      "Customer";
    return { name, email: user.email };
  }

  return { name: "Cliente", email: "cliente@example.com" };
}

export async function redirectToCheckout(
  body: CheckoutRequestBody,
  checkoutErrorMessage = "Checkout error"
): Promise<void> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: { url?: string; error?: string } = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? checkoutErrorMessage);
  }

  window.location.href = data.url;
}
