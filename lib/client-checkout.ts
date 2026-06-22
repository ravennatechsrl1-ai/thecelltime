import { User } from "@supabase/supabase-js";
import { saveInstantCheckout } from "@/lib/instant-checkout";
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

  return { name: "", email: "" };
}

export function goToCheckoutPage(): void {
  if (typeof window !== "undefined") {
    window.location.assign("/checkout");
    return;
  }
}

export function goToInstantCheckout(body: CheckoutRequestBody): void {
  saveInstantCheckout(body);
  window.location.href = "/checkout";
}
