import { NextResponse } from "next/server";
import { createSubtask } from "@/lib/db-operations";
import { CreateSubtaskSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = CreateSubtaskSchema.parse(body);
    const subtask = createSubtask(params.id, data.title);
    return NextResponse.json(subtask, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
