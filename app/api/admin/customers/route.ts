import { NextResponse } from "next/server";
import { fetchAdminCustomers } from "@/lib/admin-analytics";

export async function GET() {
  try {
    const customers = await fetchAdminCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("[admin/customers]", error);
    return NextResponse.json(
      { error: "Failed to load customers." },
      { status: 500 }
    );
  }
}
