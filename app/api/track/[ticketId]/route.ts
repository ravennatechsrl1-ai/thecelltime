import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/utils/supabase";
import { RepairTicket } from "@/types";

interface RouteParams {
  params: Promise<{ ticketId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ticketId } = await params;
    const normalizedId = ticketId.toUpperCase().trim();

    if (normalizedId.length !== 6) {
      return NextResponse.json(
        { error: "ID ticket non valido." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("repair_tickets")
      .select("*")
      .eq("ticket_id", normalizedId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Ticket non trovato. Verifica l'ID inserito." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket: data as RepairTicket });
  } catch (error) {
    console.error("[track]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
