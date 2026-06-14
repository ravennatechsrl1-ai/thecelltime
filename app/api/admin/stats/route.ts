import { NextResponse } from "next/server";
import { fetchAdminDashboardStats } from "@/lib/admin-analytics";

export async function GET() {
  try {
    const stats = await fetchAdminDashboardStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats." },
      { status: 500 }
    );
  }
}
