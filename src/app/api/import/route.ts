import { NextResponse } from "next/server";
import db from "@/lib/db";
import { BoardDataSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = BoardDataSchema.parse(body);

    const transaction = db.transaction(() => {
      // Clear existing data
      db.prepare("DELETE FROM subtasks").run();
      db.prepare("DELETE FROM cards").run();
      db.prepare("DELETE FROM history").run();
      db.prepare("DELETE FROM columns").run();

      // Insert columns
      const insertColumn = db.prepare(
        `INSERT INTO columns (id, title, position, wip_limit)
         VALUES (@id, @title, @position, @wipLimit)`
      );
      for (const col of validatedData.columns) {
        insertColumn.run(col);
      }

      // Insert cards
      const insertCard = db.prepare(
        `INSERT INTO cards (id, title, description, priority, column_id, position, created_at, moved_at, completed_at)
         VALUES (@id, @title, @description, @priority, @columnId, @position, @createdAt, @movedAt, @completedAt)`
      );
      const insertSubtask = db.prepare(
        `INSERT INTO subtasks (id, title, completed, card_id, position)
         VALUES (@id, @title, @completed, @cardId, @position)`
      );

      for (const card of validatedData.cards) {
        const { subtasks, ...cardData } = card;
        insertCard.run(cardData);

        if (subtasks && subtasks.length > 0) {
          for (const subtask of subtasks) {
            insertSubtask.run({
              ...subtask,
              completed: subtask.completed ? 1 : 0,
            });
          }
        }
      }
    });

    transaction();

    return NextResponse.json({
      success: true,
      message: "Import successful",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
