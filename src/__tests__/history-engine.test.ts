import { describe, it, expect, beforeEach } from "vitest";

// Test the history engine logic with a mock approach
// Since the history engine uses sqlite directly, we test the logic patterns

interface MockHistoryEntry {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  previousState: string;
  newState: string;
  description: string;
  timestamp: string;
  undone: boolean;
  seq: number;
}

class HistoryStack {
  private entries: MockHistoryEntry[] = [];
  private seqCounter = 0;

  record(
    actionType: string,
    entityType: string,
    entityId: string,
    previousState: unknown,
    newState: unknown,
    description: string
  ): void {
    // Clear redo stack on new action
    this.entries = this.entries.filter((e) => !e.undone);
    this.entries.push({
      id: crypto.randomUUID(),
      actionType,
      entityType,
      entityId,
      previousState: JSON.stringify(previousState),
      newState: JSON.stringify(newState),
      description,
      timestamp: new Date().toISOString(),
      undone: false,
      seq: this.seqCounter++,
    });
  }

  getUndoStack(): MockHistoryEntry[] {
    return this.entries
      .filter((e) => !e.undone)
      .sort((a, b) => b.seq - a.seq);
  }

  getRedoStack(): MockHistoryEntry[] {
    return this.entries
      .filter((e) => e.undone)
      .sort((a, b) => b.seq - a.seq);
  }

  undo(): MockHistoryEntry | null {
    const undoStack = this.getUndoStack();
    if (undoStack.length === 0) return null;
    const entry = undoStack[0];
    entry.undone = true;
    return entry;
  }

  redo(): MockHistoryEntry | null {
    const redoStack = this.getRedoStack();
    if (redoStack.length === 0) return null;
    // Most recent undone = last in time order
    const entry = redoStack[redoStack.length - 1];
    entry.undone = false;
    return entry;
  }

  clear(): void {
    this.entries = [];
  }
}

describe("History Engine (Undo/Redo Stack)", () => {
  let history: HistoryStack;

  beforeEach(() => {
    history = new HistoryStack();
  });

  it("should start with empty undo and redo stacks", () => {
    expect(history.getUndoStack()).toHaveLength(0);
    expect(history.getRedoStack()).toHaveLength(0);
  });

  it("should record actions to the undo stack", () => {
    history.record(
      "create_card",
      "card",
      "card-1",
      null,
      { id: "card-1", title: "Test" },
      "Created card"
    );

    expect(history.getUndoStack()).toHaveLength(1);
    expect(history.getRedoStack()).toHaveLength(0);
  });

  it("should record multiple actions in order", () => {
    history.record("create_card", "card", "card-1", null, { id: "card-1" }, "Created card 1");
    history.record("create_card", "card", "card-2", null, { id: "card-2" }, "Created card 2");
    history.record("move_card", "card", "card-1", { columnId: "col-1" }, { columnId: "col-2" }, "Moved card 1");

    const undoStack = history.getUndoStack();
    expect(undoStack).toHaveLength(3);
    // Most recent first
    expect(undoStack[0].description).toBe("Moved card 1");
  });

  it("should undo the last action", () => {
    history.record("create_card", "card", "card-1", null, { id: "card-1" }, "Created card 1");
    history.record("create_card", "card", "card-2", null, { id: "card-2" }, "Created card 2");

    const entry = history.undo();
    expect(entry).not.toBeNull();
    expect(entry!.description).toBe("Created card 2");
    expect(history.getUndoStack()).toHaveLength(1);
    expect(history.getRedoStack()).toHaveLength(1);
  });

  it("should redo an undone action", () => {
    history.record("create_card", "card", "card-1", null, { id: "card-1" }, "Created card 1");
    history.undo();

    expect(history.getUndoStack()).toHaveLength(0);
    expect(history.getRedoStack()).toHaveLength(1);

    const entry = history.redo();
    expect(entry).not.toBeNull();
    expect(entry!.description).toBe("Created card 1");
    expect(history.getUndoStack()).toHaveLength(1);
    expect(history.getRedoStack()).toHaveLength(0);
  });

  it("should return null when undoing empty stack", () => {
    const entry = history.undo();
    expect(entry).toBeNull();
  });

  it("should return null when redoing empty stack", () => {
    const entry = history.redo();
    expect(entry).toBeNull();
  });

  it("should clear redo stack on new action", () => {
    history.record("create_card", "card", "card-1", null, { id: "card-1" }, "Created card 1");
    history.record("create_card", "card", "card-2", null, { id: "card-2" }, "Created card 2");

    history.undo(); // Undo card-2
    expect(history.getRedoStack()).toHaveLength(1);

    // New action should clear redo stack
    history.record("create_card", "card", "card-3", null, { id: "card-3" }, "Created card 3");
    expect(history.getRedoStack()).toHaveLength(0);
    expect(history.getUndoStack()).toHaveLength(2); // card-1 + card-3
  });

  it("should handle multiple undo/redo cycles", () => {
    history.record("create_card", "card", "card-1", null, { id: "card-1" }, "Action 1");
    history.record("create_card", "card", "card-2", null, { id: "card-2" }, "Action 2");
    history.record("create_card", "card", "card-3", null, { id: "card-3" }, "Action 3");

    // Undo all
    history.undo(); // Undo Action 3
    history.undo(); // Undo Action 2
    history.undo(); // Undo Action 1

    expect(history.getUndoStack()).toHaveLength(0);
    expect(history.getRedoStack()).toHaveLength(3);

    // Redo all
    history.redo(); // Redo Action 1
    history.redo(); // Redo Action 2
    history.redo(); // Redo Action 3

    expect(history.getUndoStack()).toHaveLength(3);
    expect(history.getRedoStack()).toHaveLength(0);
  });

  it("should preserve previous and new state in entries", () => {
    const prevState = { columnId: "col-1", position: 0 };
    const newState = { columnId: "col-2", position: 1 };

    history.record("move_card", "card", "card-1", prevState, newState, "Moved card");

    const entry = history.getUndoStack()[0];
    expect(JSON.parse(entry.previousState)).toEqual(prevState);
    expect(JSON.parse(entry.newState)).toEqual(newState);
  });

  it("should handle undo after undo correctly", () => {
    history.record("create_card", "card", "card-1", null, {}, "Action 1");
    history.record("edit_card", "card", "card-1", { title: "Old" }, { title: "New" }, "Action 2");

    const first = history.undo();
    expect(first!.actionType).toBe("edit_card");

    const second = history.undo();
    expect(second!.actionType).toBe("create_card");

    expect(history.getUndoStack()).toHaveLength(0);
    expect(history.getRedoStack()).toHaveLength(2);
  });
});
