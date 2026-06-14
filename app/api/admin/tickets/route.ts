import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/utils/supabase";
import { RepairTicket } from "@/types";

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("repair_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/tickets/list]", error);
      return NextResponse.json(
        { error: "Errore nel recupero dei ticket." },
        { status: 500 }
      );
    }

    return NextResponse.json({ tickets: (data ?? []) as RepairTicket[] });
  } catch (error) {
    console.error("[admin/tickets]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
