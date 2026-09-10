import db from "@/lib/db";
import type { HistoryEntry } from "@/lib/types";

function mapHistoryEntry(row: any): HistoryEntry {
  return {
    id: row.id,
    actionType: row.action_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    previousState: row.previous_state,
    newState: row.new_state,
    description: row.description,
    timestamp: row.timestamp,
  };
}

export function getHistory(): {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
} {
  const undoRows = db
    .prepare("SELECT * FROM history WHERE undone = 0 ORDER BY timestamp DESC")
    .all();
  const redoRows = db
    .prepare("SELECT * FROM history WHERE undone = 1 ORDER BY timestamp DESC")
    .all();
  return {
    undoStack: undoRows.map(mapHistoryEntry),
    redoStack: redoRows.map(mapHistoryEntry),
  };
}

export function clearRedoStack(): void {
  db.prepare("DELETE FROM history WHERE undone = 1").run();
}

export function undo(): HistoryEntry | null {
  const row = db
    .prepare(
      "SELECT * FROM history WHERE undone = 0 ORDER BY timestamp DESC LIMIT 1"
    )
    .get() as any;
  if (!row) return null;

  const entry = mapHistoryEntry(row);
  const prevState = entry.previousState
    ? JSON.parse(entry.previousState)
    : null;
  const entityId = entry.entityId;

  const performUndo = db.transaction(() => {
    switch (entry.actionType) {
      case "create_card":
        db.prepare("DELETE FROM subtasks WHERE card_id = ?").run(entityId);
        db.prepare("DELETE FROM cards WHERE id = ?").run(entityId);
        break;

      case "delete_card":
        if (prevState) {
          db.prepare(
            `INSERT INTO cards (id, title, description, priority, column_id, position, created_at, moved_at, completed_at)
             VALUES (@id, @title, @description, @priority, @columnId, @position, @createdAt, @movedAt, @completedAt)`
          ).run(prevState);
          if (prevState.subtasks && Array.isArray(prevState.subtasks)) {
            const insertSt = db.prepare(
              `INSERT INTO subtasks (id, title, completed, card_id, position)
               VALUES (@id, @title, @completed, @cardId, @position)`
            );
            for (const st of prevState.subtasks) {
              insertSt.run({ ...st, completed: st.completed ? 1 : 0 });
            }
          }
        }
        break;

      case "move_card":
        if (prevState) {
          db.prepare(
            `UPDATE cards SET column_id = @columnId, position = @position,
             moved_at = @movedAt, completed_at = @completedAt WHERE id = @id`
          ).run({
            id: entityId,
            columnId: prevState.columnId,
            position: prevState.position,
            movedAt: prevState.movedAt,
            completedAt: prevState.completedAt,
          });
        }
        break;

      case "edit_card":
        if (prevState) {
          db.prepare(
            `UPDATE cards SET title = @title, description = @description,
             priority = @priority WHERE id = @id`
          ).run({
            id: entityId,
            title: prevState.title,
            description: prevState.description,
            priority: prevState.priority,
          });
        }
        break;

      case "create_subtask":
        db.prepare("DELETE FROM subtasks WHERE id = ?").run(entityId);
        break;

      case "delete_subtask":
        if (prevState) {
          db.prepare(
            `INSERT INTO subtasks (id, title, completed, card_id, position)
             VALUES (@id, @title, @completed, @cardId, @position)`
          ).run({ ...prevState, completed: prevState.completed ? 1 : 0 });
        }
        break;

      case "toggle_subtask":
        if (prevState) {
          db.prepare("UPDATE subtasks SET completed = ? WHERE id = ?").run(
            prevState.completed ? 1 : 0,
            entityId
          );
        }
        break;

      case "edit_column":
        if (prevState) {
          db.prepare(
            "UPDATE columns SET title = @title, wip_limit = @wipLimit WHERE id = @id"
          ).run({
            id: entityId,
            title: prevState.title,
            wipLimit: prevState.wipLimit,
          });
        }
        break;
    }
    db.prepare("UPDATE history SET undone = 1 WHERE id = ?").run(entry.id);
  });

  performUndo();
  return entry;
}

export function redo(): HistoryEntry | null {
  const row = db
    .prepare(
      "SELECT * FROM history WHERE undone = 1 ORDER BY timestamp ASC LIMIT 1"
    )
    .get() as any;
  if (!row) return null;

  const entry = mapHistoryEntry(row);
  const nextState = entry.newState ? JSON.parse(entry.newState) : null;
  const entityId = entry.entityId;

  const performRedo = db.transaction(() => {
    switch (entry.actionType) {
      case "create_card":
        if (nextState) {
          db.prepare(
            `INSERT INTO cards (id, title, description, priority, column_id, position, created_at, moved_at, completed_at)
             VALUES (@id, @title, @description, @priority, @columnId, @position, @createdAt, @movedAt, @completedAt)`
          ).run(nextState);
        }
        break;

      case "delete_card":
        db.prepare("DELETE FROM subtasks WHERE card_id = ?").run(entityId);
        db.prepare("DELETE FROM cards WHERE id = ?").run(entityId);
        break;

      case "move_card":
        if (nextState) {
          db.prepare(
            `UPDATE cards SET column_id = @columnId, position = @position,
             moved_at = @movedAt, completed_at = @completedAt WHERE id = @id`
          ).run({
            id: entityId,
            columnId: nextState.columnId,
            position: nextState.position,
            movedAt: nextState.movedAt,
            completedAt: nextState.completedAt,
          });
        }
        break;

      case "edit_card":
        if (nextState) {
          db.prepare(
            `UPDATE cards SET title = @title, description = @description,
             priority = @priority WHERE id = @id`
          ).run({
            id: entityId,
            title: nextState.title,
            description: nextState.description,
            priority: nextState.priority,
          });
        }
        break;

      case "create_subtask":
        if (nextState) {
          db.prepare(
            `INSERT INTO subtasks (id, title, completed, card_id, position)
             VALUES (@id, @title, @completed, @cardId, @position)`
          ).run({ ...nextState, completed: nextState.completed ? 1 : 0 });
        }
        break;

      case "delete_subtask":
        db.prepare("DELETE FROM subtasks WHERE id = ?").run(entityId);
        break;

      case "toggle_subtask":
        if (nextState) {
          db.prepare("UPDATE subtasks SET completed = ? WHERE id = ?").run(
            nextState.completed ? 1 : 0,
            entityId
          );
        }
        break;

      case "edit_column":
        if (nextState) {
          db.prepare(
            "UPDATE columns SET title = @title, wip_limit = @wipLimit WHERE id = @id"
          ).run({
            id: entityId,
            title: nextState.title,
            wipLimit: nextState.wipLimit,
          });
        }
        break;
    }
    db.prepare("UPDATE history SET undone = 0 WHERE id = ?").run(entry.id);
  });

  performRedo();
  return entry;
}
