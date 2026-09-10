import { NextResponse } from "next/server";
import { getColumns, updateColumn } from "@/lib/db-operations";
import { UpdateColumnSchema } from "@/lib/schemas";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const columns = getColumns();
    return NextResponse.json(columns);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Column id is required" },
        { status: 400 }
      );
    }
    const validatedUpdates = UpdateColumnSchema.parse(updates);
    const updatedColumn = updateColumn(id, validatedUpdates);
    return NextResponse.json(updatedColumn);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
