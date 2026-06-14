import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/utils/supabase";
import { AdminTicketUpdatePayload, RepairTicket, RepairTicketStatus } from "@/types";

const VALID_STATUSES: RepairTicketStatus[] = [
  "Ricevuto",
  "In Diagnostica",
  "In Riparazione",
  "Pronto al Ritiro",
];

interface RouteParams {
  params: Promise<{ ticketId: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ticketId } = await params;
    const body: Pick<AdminTicketUpdatePayload, "status"> = await request.json();

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Stato non valido." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const normalizedId = ticketId.toUpperCase().trim();

    const { data, error } = await supabase
      .from("repair_tickets")
      .update({ status: body.status })
      .eq("ticket_id", normalizedId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[admin/tickets/patch]", error);
      return NextResponse.json(
        { error: "Aggiornamento ticket fallito." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket: data as RepairTicket });
  } catch (error) {
    console.error("[admin/tickets]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
