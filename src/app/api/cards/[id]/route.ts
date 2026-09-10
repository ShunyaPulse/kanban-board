import { NextResponse } from "next/server";
import {
  getCard,
  moveCard,
  updateCard,
  deleteCard,
} from "@/lib/db-operations";
import { MoveCardSchema, UpdateCardSchema } from "@/lib/schemas";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const card = getCard(params.id);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json(card);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if ("columnId" in body && "position" in body) {
      const data = MoveCardSchema.parse(body);
      const movedCard = moveCard(params.id, data.columnId, data.position);
      return NextResponse.json(movedCard);
    } else {
      const data = UpdateCardSchema.parse(body);
      const updatedCard = updateCard(params.id, data);
      return NextResponse.json(updatedCard);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("WIP limit exceeded")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    deleteCard(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
