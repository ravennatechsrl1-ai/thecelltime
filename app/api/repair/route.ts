import { NextRequest, NextResponse } from "next/server";
import { generateTicketId } from "@/lib/constants";
import { getSupabaseClient } from "@/utils/supabase";
import { RepairBookingPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RepairBookingPayload = await request.json();

    if (
      !body.deviceBrand ||
      !body.deviceModel ||
      !body.issue ||
      !body.customerName ||
      !body.customerPhone ||
      !body.customerEmail
    ) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori." },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("repair_tickets")
      .insert({
        ticket_id: ticketId,
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        customer_email: body.customerEmail,
        device_brand: body.deviceBrand,
        device_model: body.deviceModel,
        issue: body.issue,
        estimated_price: body.estimatedPrice,
        status: "Ricevuto",
      })
      .select("ticket_id")
      .single();

    if (error) {
      console.error("[repair/create]", error);
      return NextResponse.json(
        { error: "Errore durante la creazione del ticket." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticketId: data.ticket_id });
  } catch (error) {
    console.error("[repair]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
