import db from "./db";
import { v4 as uuidv4 } from "uuid";
import type {
  Column,
  Card,
  Subtask,
  CardWithSubtasks,
  ActionType,
  Priority,
} from "./types";

function mapColumn(row: any): Column {
  return {
    id: row.id,
    title: row.title,
    position: row.position,
    wipLimit: row.wip_limit,
  };
}

function mapCard(row: any): Card {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority as Priority,
    columnId: row.column_id,
    position: row.position,
    createdAt: row.created_at,
    movedAt: row.moved_at,
    completedAt: row.completed_at,
  };
}

function mapSubtask(row: any): Subtask {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    cardId: row.card_id,
    position: row.position,
  };
}

function recordHistory(
  actionType: ActionType,
  entityType: "card" | "subtask" | "column",
  entityId: string,
  previousState: unknown,
  newState: unknown,
  description: string
): void {
  db.prepare(
    "INSERT INTO history (id, action_type, entity_type, entity_id, previous_state, new_state, description, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    uuidv4(),
    actionType,
    entityType,
    entityId,
    JSON.stringify(previousState),
    JSON.stringify(newState),
    description,
    new Date().toISOString()
  );
}

export function getColumns(): Column[] {
  const rows = db
    .prepare("SELECT * FROM columns ORDER BY position ASC")
    .all();
  return rows.map(mapColumn);
}

export function getColumnCardCount(columnId: string): number {
  const row = db
    .prepare("SELECT count(*) as count FROM cards WHERE column_id = ?")
    .get(columnId) as { count: number };
  return row.count;
}

export function validateWipLimit(
  columnId: string,
  excludeCardId?: string
): void {
  const columnRow = db
    .prepare("SELECT wip_limit FROM columns WHERE id = ?")
    .get(columnId) as { wip_limit: number } | undefined;
  if (!columnRow || columnRow.wip_limit === 0) return;

  let count: number;
  if (excludeCardId) {
    const row = db
      .prepare(
        "SELECT count(*) as count FROM cards WHERE column_id = ? AND id != ?"
      )
      .get(columnId, excludeCardId) as { count: number };
    count = row.count;
  } else {
    const row = db
      .prepare(
        "SELECT count(*) as count FROM cards WHERE column_id = ?"
      )
      .get(columnId) as { count: number };
    count = row.count;
  }

  if (count >= columnRow.wip_limit) {
    throw new Error("WIP limit exceeded");
  }
}

export function getCards(): CardWithSubtasks[] {
  const cardRows = db
    .prepare("SELECT * FROM cards ORDER BY position ASC")
    .all();
  const subtaskRows = db
    .prepare("SELECT * FROM subtasks ORDER BY position ASC")
    .all();

  const subtasksMap = new Map<string, Subtask[]>();
  for (const row of subtaskRows) {
    const st = mapSubtask(row);
    if (!subtasksMap.has(st.cardId)) {
      subtasksMap.set(st.cardId, []);
    }
    subtasksMap.get(st.cardId)!.push(st);
  }

  return cardRows.map((row) => {
    const card = mapCard(row);
    return {
      ...card,
      subtasks: subtasksMap.get(card.id) || [],
    };
  });
}

export function getCardsByColumn(columnId: string): CardWithSubtasks[] {
  const cardRows = db
    .prepare(
      "SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC"
    )
    .all(columnId);
  const subtaskRows = db
    .prepare(
      "SELECT subtasks.* FROM subtasks JOIN cards ON subtasks.card_id = cards.id WHERE cards.column_id = ? ORDER BY subtasks.position ASC"
    )
    .all(columnId);

  const subtasksMap = new Map<string, Subtask[]>();
  for (const row of subtaskRows) {
    const st = mapSubtask(row);
    if (!subtasksMap.has(st.cardId)) {
      subtasksMap.set(st.cardId, []);
    }
    subtasksMap.get(st.cardId)!.push(st);
  }

  return cardRows.map((row) => {
    const card = mapCard(row);
    return {
      ...card,
      subtasks: subtasksMap.get(card.id) || [],
    };
  });
}

export function getCard(id: string): CardWithSubtasks | null {
  const row = db.prepare("SELECT * FROM cards WHERE id = ?").get(id);
  if (!row) return null;

  const card = mapCard(row);
  const subtaskRows = db
    .prepare(
      "SELECT * FROM subtasks WHERE card_id = ? ORDER BY position ASC"
    )
    .all(id);

  return {
    ...card,
    subtasks: subtaskRows.map(mapSubtask),
  };
}

export function createCard(
  title: string,
  columnId: string,
  description: string = "",
  priority: Priority = "medium"
): CardWithSubtasks {
  validateWipLimit(columnId);

  const now = new Date().toISOString();
  const id = uuidv4();

  const posRow = db
    .prepare(
      "SELECT COALESCE(MAX(position), -1) + 1 as pos FROM cards WHERE column_id = ?"
    )
    .get(columnId) as { pos: number };
  const position = posRow.pos;

  const card: Card = {
    id,
    title,
    description,
    priority,
    columnId,
    position,
    createdAt: now,
    movedAt: now,
    completedAt: null,
  };

  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO cards (id, title, description, priority, column_id, position, created_at, moved_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      card.id,
      card.title,
      card.description,
      card.priority,
      card.columnId,
      card.position,
      card.createdAt,
      card.movedAt,
      card.completedAt
    );

    recordHistory(
      "create_card",
      "card",
      id,
      null,
      card,
      "Created card: " + title
    );
  });

  tx();

  return { ...card, subtasks: [] };
}

export function updateCard(
  id: string,
  updates: Partial<Pick<Card, "title" | "description" | "priority">>
): CardWithSubtasks {
  const card = getCard(id);
  if (!card) throw new Error("Card not found");

  const updatedCard = { ...card };
  if (updates.title !== undefined) updatedCard.title = updates.title;
  if (updates.description !== undefined)
    updatedCard.description = updates.description;
  if (updates.priority !== undefined)
    updatedCard.priority = updates.priority;

  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE cards SET title = ?, description = ?, priority = ? WHERE id = ?"
    ).run(updatedCard.title, updatedCard.description, updatedCard.priority, id);

    const { subtasks: _ns, ...newCardData } = updatedCard;
    const { subtasks: _os, ...oldCardData } = card;

    recordHistory(
      "edit_card",
      "card",
      id,
      oldCardData,
      newCardData,
      "Updated card: " + updatedCard.title
    );
  });

  tx();

  return getCard(id)!;
}

export function moveCard(
  id: string,
  targetColumnId: string,
  targetPosition: number
): CardWithSubtasks {
  const card = getCard(id);
  if (!card) throw new Error("Card not found");

  if (card.columnId !== targetColumnId) {
    validateWipLimit(targetColumnId, id);
  }

  const columns = getColumns();
  const lastColumn = columns[columns.length - 1];

  let completedAt = card.completedAt;
  if (
    targetColumnId === lastColumn.id &&
    card.columnId !== lastColumn.id
  ) {
    completedAt = new Date().toISOString();
  } else if (
    targetColumnId !== lastColumn.id &&
    card.columnId === lastColumn.id
  ) {
    completedAt = null;
  }

  const movedAt = new Date().toISOString();

  const tx = db.transaction(() => {
    if (card.columnId === targetColumnId) {
      // Same column reorder
      if (card.position < targetPosition) {
        db.prepare(
          "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ? AND position <= ? AND id != ?"
        ).run(card.columnId, card.position, targetPosition, id);
      } else {
        db.prepare(
          "UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ? AND position < ? AND id != ?"
        ).run(card.columnId, targetPosition, card.position, id);
      }
    } else {
      // Cross-column move
      db.prepare(
        "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?"
      ).run(card.columnId, card.position);

      db.prepare(
        "UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ?"
      ).run(targetColumnId, targetPosition);
    }

    db.prepare(
      "UPDATE cards SET column_id = ?, position = ?, moved_at = ?, completed_at = ? WHERE id = ?"
    ).run(targetColumnId, targetPosition, movedAt, completedAt, id);

    const { subtasks: _ns, ...newState } = {
      ...card,
      columnId: targetColumnId,
      position: targetPosition,
      movedAt,
      completedAt,
    };
    const { subtasks: _os, ...oldState } = card;

    recordHistory(
      "move_card",
      "card",
      id,
      oldState,
      newState,
      "Moved card: " + card.title
    );
  });

  tx();

  return getCard(id)!;
}

export function deleteCard(id: string): void {
  const card = getCard(id);
  if (!card) return;

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM subtasks WHERE card_id = ?").run(id);
    db.prepare("DELETE FROM cards WHERE id = ?").run(id);
    db.prepare(
      "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?"
    ).run(card.columnId, card.position);

    const { subtasks: _s, ...oldCardState } = card;

    recordHistory(
      "delete_card",
      "card",
      id,
      { ...oldCardState, subtasks: card.subtasks },
      null,
      "Deleted card: " + card.title
    );
  });

  tx();
}

export function createSubtask(cardId: string, title: string): Subtask {
  const id = uuidv4();
  const posRow = db
    .prepare(
      "SELECT COALESCE(MAX(position), -1) + 1 as pos FROM subtasks WHERE card_id = ?"
    )
    .get(cardId) as { pos: number };

  const subtask: Subtask = {
    id,
    title,
    completed: false,
    cardId,
    position: posRow.pos,
  };

  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO subtasks (id, title, completed, card_id, position) VALUES (?, ?, 0, ?, ?)"
    ).run(id, title, cardId, subtask.position);

    recordHistory(
      "create_subtask",
      "subtask",
      id,
      null,
      subtask,
      "Created subtask: " + title
    );
  });

  tx();

  return subtask;
}

export function toggleSubtask(id: string): Subtask {
  const row = db.prepare("SELECT * FROM subtasks WHERE id = ?").get(id);
  if (!row) throw new Error("Subtask not found");

  const subtask = mapSubtask(row);
  const newCompleted = !subtask.completed;

  const tx = db.transaction(() => {
    db.prepare("UPDATE subtasks SET completed = ? WHERE id = ?").run(
      newCompleted ? 1 : 0,
      id
    );

    const newSubtaskState = { ...subtask, completed: newCompleted };
    recordHistory(
      "toggle_subtask",
      "subtask",
      id,
      subtask,
      newSubtaskState,
      "Toggled subtask: " + subtask.title
    );
  });

  tx();

  return { ...subtask, completed: newCompleted };
}

export function deleteSubtask(id: string): void {
  const row = db.prepare("SELECT * FROM subtasks WHERE id = ?").get(id);
  if (!row) return;

  const subtask = mapSubtask(row);

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM subtasks WHERE id = ?").run(id);
    db.prepare(
      "UPDATE subtasks SET position = position - 1 WHERE card_id = ? AND position > ?"
    ).run(subtask.cardId, subtask.position);

    recordHistory(
      "delete_subtask",
      "subtask",
      id,
      subtask,
      null,
      "Deleted subtask: " + subtask.title
    );
  });

  tx();
}

export function updateColumn(
  id: string,
  updates: Partial<Pick<Column, "title" | "wipLimit">>
): Column {
  const row = db.prepare("SELECT * FROM columns WHERE id = ?").get(id);
  if (!row) throw new Error("Column not found");

  const column = mapColumn(row);
  const updatedColumn = { ...column };
  if (updates.title !== undefined) updatedColumn.title = updates.title;
  if (updates.wipLimit !== undefined)
    updatedColumn.wipLimit = updates.wipLimit;

  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE columns SET title = ?, wip_limit = ? WHERE id = ?"
    ).run(updatedColumn.title, updatedColumn.wipLimit, id);

    recordHistory(
      "edit_column",
      "column",
      id,
      column,
      updatedColumn,
      "Updated column: " + updatedColumn.title
    );
  });

  tx();

  return updatedColumn;
}
