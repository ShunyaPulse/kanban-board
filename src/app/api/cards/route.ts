import { NextResponse } from "next/server";
import { getCards, createCard } from "@/lib/db-operations";
import { CreateCardSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const cards = getCards();
    return NextResponse.json(cards);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = CreateCardSchema.parse(body);
    const newCard = createCard(
      data.title,
      data.columnId,
      data.description,
      data.priority
    );
    return NextResponse.json(newCard, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("WIP limit exceeded")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
