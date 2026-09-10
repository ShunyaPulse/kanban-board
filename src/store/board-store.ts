"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  ColumnWithCards,
  CardWithSubtasks,
  Subtask,
  Metrics,
  HistoryEntry,
  Priority,
} from "@/lib/types";

interface BoardState {
  columns: ColumnWithCards[];
  metrics: Metrics | null;
  undoStack: ColumnWithCards[][];
  redoStack: ColumnWithCards[][];
  isLoading: boolean;
  error: string | null;
  selectedCard: CardWithSubtasks | null;
  showMetrics: boolean;

  // Internal helper
  _saveHistory: (newColumns: ColumnWithCards[]) => void;

  // Actions
  fetchBoard: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  createCard: (
    title: string,
    columnId: string,
    description?: string,
    priority?: Priority
  ) => Promise<CardWithSubtasks | null>;
  updateCard: (
    id: string,
    updates: Partial<Pick<CardWithSubtasks, "title" | "description" | "priority">>
  ) => Promise<CardWithSubtasks | null>;
  moveCard: (
    id: string,
    targetColumnId: string,
    targetPosition: number
  ) => Promise<CardWithSubtasks | null>;
  deleteCard: (id: string) => Promise<boolean>;
  createSubtask: (cardId: string, title: string) => Promise<Subtask | null>;
  toggleSubtask: (cardId: string, subtaskId: string) => Promise<Subtask | null>;
  deleteSubtask: (cardId: string, subtaskId: string) => Promise<boolean>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  setSelectedCard: (card: CardWithSubtasks | null) => void;
  toggleMetrics: () => void;
  exportBoard: () => Promise<string | null>;
  importBoard: (data: any) => Promise<boolean>;
  setError: (error: string | null) => void;
}

const defaultColumns: ColumnWithCards[] = [
  { id: 'col-todo', title: 'To Do', position: 0, wipLimit: 0, cards: [] },
  { id: 'col-in-progress', title: 'In Progress', position: 1, wipLimit: 3, cards: [] },
  { id: 'col-review', title: 'Review', position: 2, wipLimit: 2, cards: [] },
  { id: 'col-done', title: 'Done', position: 3, wipLimit: 0, cards: [] },
];

function calculateMetricsLocal(columns: ColumnWithCards[]): Metrics {
  let totalCards = 0;
  let completedCards = 0;
  let totalLeadTime = 0;
  let leadTimeCount = 0;
  const wipAlerts: { columnId: string; columnTitle: string; current: number; limit: number }[] = [];
  const columnDistribution: { columnId: string; title: string; count: number }[] = [];

  const throughputMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    throughputMap.set(d.toISOString().split('T')[0], 0);
  }

  for (const col of columns) {
    const count = col.cards.length;
    totalCards += count;
    if (col.wipLimit > 0 && count >= col.wipLimit) {
      wipAlerts.push({ columnId: col.id, columnTitle: col.title, current: count, limit: col.wipLimit });
    }
    columnDistribution.push({ columnId: col.id, title: col.title, count });

    for (const card of col.cards) {
      if (card.completedAt) {
        completedCards++;
        const created = new Date(card.createdAt).getTime();
        const completed = new Date(card.completedAt).getTime();
        totalLeadTime += (completed - created) / (1000 * 60 * 60); // hours
        leadTimeCount++;

        const compDateStr = card.completedAt.split('T')[0];
        if (throughputMap.has(compDateStr)) {
          throughputMap.set(compDateStr, throughputMap.get(compDateStr)! + 1);
        }
      }
    }
  }

  const averageLeadTime = leadTimeCount > 0 ? totalLeadTime / leadTimeCount : null;
  const recentThroughput = Array.from(throughputMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalCards, completedCards, averageLeadTime, wipAlerts, columnDistribution, throughput: recentThroughput };
}

// Deep clone helper
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      columns: defaultColumns,
      metrics: null,
      undoStack: [],
      redoStack: [],
      isLoading: false,
      error: null,
      selectedCard: null,
      showMetrics: false,

      _saveHistory: (newColumns: ColumnWithCards[]) => {
        const current = clone(get().columns);
        set((state) => ({
          undoStack: [...state.undoStack, current],
          redoStack: [],
          columns: newColumns,
          metrics: calculateMetricsLocal(newColumns)
        }));
      },

      fetchBoard: async () => {
        set({ isLoading: false, metrics: calculateMetricsLocal(get().columns) });
      },
      fetchMetrics: async () => {
        set({ metrics: calculateMetricsLocal(get().columns) });
      },
      fetchHistory: async () => {},

      createCard: async (title, columnId, description = "", priority = "medium") => {
        const columns = clone(get().columns);
        const col = columns.find(c => c.id === columnId);
        if (!col) return null;

        if (col.wipLimit > 0 && col.cards.length >= col.wipLimit) {
          set({ error: "Failed to create card (WIP limit may be exceeded)" });
          return null;
        }

        const now = new Date().toISOString();
        const newCard: CardWithSubtasks = {
          id: uuidv4(),
          title,
          description,
          priority,
          columnId,
          position: col.cards.length,
          createdAt: now,
          movedAt: now,
          completedAt: null,
          subtasks: []
        };

        col.cards.push(newCard);
        get()._saveHistory(columns);
        return newCard;
      },

      updateCard: async (id, updates) => {
        const columns = clone(get().columns);
        let updatedCard: CardWithSubtasks | null = null;
        
        for (const col of columns) {
          const cardIndex = col.cards.findIndex(c => c.id === id);
          if (cardIndex !== -1) {
            col.cards[cardIndex] = { ...col.cards[cardIndex], ...updates };
            updatedCard = col.cards[cardIndex];
            break;
          }
        }
        if (!updatedCard) return null;
        
        get()._saveHistory(columns);
        if (get().selectedCard?.id === id) {
          set({ selectedCard: updatedCard });
        }
        return updatedCard;
      },

      moveCard: async (id, targetColumnId, targetPosition) => {
        const columns = clone(get().columns);
        let cardToMove: CardWithSubtasks | null = null;
        let sourceCol: ColumnWithCards | null = null;

        for (const col of columns) {
          const idx = col.cards.findIndex(c => c.id === id);
          if (idx !== -1) {
            cardToMove = col.cards[idx];
            sourceCol = col;
            col.cards.splice(idx, 1);
            break;
          }
        }
        if (!cardToMove || !sourceCol) return null;

        const targetCol = columns.find(c => c.id === targetColumnId);
        if (!targetCol) return null;

        if (sourceCol.id !== targetColumnId && targetCol.wipLimit > 0 && targetCol.cards.length >= targetCol.wipLimit) {
          set({ error: "Target column has reached its WIP limit" });
          return null;
        }

        cardToMove.columnId = targetColumnId;
        cardToMove.movedAt = new Date().toISOString();
        
        // Handle completion date if moving to "Done" (assuming last column or specific ID)
        if (targetCol.title.toLowerCase() === 'done' || targetCol.id === 'col-done') {
          cardToMove.completedAt = cardToMove.completedAt || new Date().toISOString();
        } else {
          cardToMove.completedAt = null;
        }

        targetCol.cards.splice(targetPosition, 0, cardToMove);

        // Update positions
        sourceCol.cards.forEach((c, i) => c.position = i);
        if (sourceCol.id !== targetColumnId) {
          targetCol.cards.forEach((c, i) => c.position = i);
        }

        get()._saveHistory(columns);
        return cardToMove;
      },

      deleteCard: async (id) => {
        const columns = clone(get().columns);
        for (const col of columns) {
          const idx = col.cards.findIndex(c => c.id === id);
          if (idx !== -1) {
            col.cards.splice(idx, 1);
            col.cards.forEach((c, i) => c.position = i);
            break;
          }
        }
        get()._saveHistory(columns);
        if (get().selectedCard?.id === id) {
          set({ selectedCard: null });
        }
        return true;
      },

      createSubtask: async (cardId, title) => {
        const columns = clone(get().columns);
        let newSubtask: Subtask | null = null;
        let updatedCard: CardWithSubtasks | null = null;

        for (const col of columns) {
          const card = col.cards.find(c => c.id === cardId);
          if (card) {
            newSubtask = {
              id: uuidv4(),
              title,
              completed: false,
              cardId,
              position: card.subtasks ? card.subtasks.length : 0
            };
            card.subtasks = card.subtasks || [];
            card.subtasks.push(newSubtask);
            updatedCard = card;
            break;
          }
        }
        if (!newSubtask) return null;

        get()._saveHistory(columns);
        if (get().selectedCard?.id === cardId) set({ selectedCard: updatedCard });
        return newSubtask;
      },

      toggleSubtask: async (cardId, subtaskId) => {
        const columns = clone(get().columns);
        let updatedCard: CardWithSubtasks | null = null;

        for (const col of columns) {
          const card = col.cards.find(c => c.id === cardId);
          if (card && card.subtasks) {
            const st = card.subtasks.find(s => s.id === subtaskId);
            if (st) {
              st.completed = !st.completed;
              updatedCard = card;
            }
            break;
          }
        }
        if (!updatedCard) return null;

        get()._saveHistory(columns);
        if (get().selectedCard?.id === cardId) set({ selectedCard: updatedCard });
        return updatedCard?.subtasks?.find(s => s.id === subtaskId) || null;
      },

      deleteSubtask: async (cardId, subtaskId) => {
        const columns = clone(get().columns);
        let updatedCard: CardWithSubtasks | null = null;

        for (const col of columns) {
          const card = col.cards.find(c => c.id === cardId);
          if (card && card.subtasks) {
            const idx = card.subtasks.findIndex(s => s.id === subtaskId);
            if (idx !== -1) {
              card.subtasks.splice(idx, 1);
              card.subtasks.forEach((s, i) => s.position = i);
              updatedCard = card;
            }
            break;
          }
        }
        if (!updatedCard) return false;

        get()._saveHistory(columns);
        if (get().selectedCard?.id === cardId) set({ selectedCard: updatedCard });
        return true;
      },

      undo: async () => {
        const { undoStack, redoStack, columns } = get();
        if (undoStack.length === 0) return;
        
        const previousState = undoStack[undoStack.length - 1];
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, columns],
          columns: previousState,
          metrics: calculateMetricsLocal(previousState)
        });
      },

      redo: async () => {
        const { undoStack, redoStack, columns } = get();
        if (redoStack.length === 0) return;
        
        const nextState = redoStack[redoStack.length - 1];
        set({
          redoStack: redoStack.slice(0, -1),
          undoStack: [...undoStack, columns],
          columns: nextState,
          metrics: calculateMetricsLocal(nextState)
        });
      },

      setSelectedCard: (card) => set({ selectedCard: card }),
      toggleMetrics: () => set((state) => ({ showMetrics: !state.showMetrics })),
      
      exportBoard: async () => {
        const data = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          columns: get().columns
        };
        return JSON.stringify(data, null, 2);
      },

      importBoard: async (data: any) => {
        try {
          if (!data || !data.columns || !Array.isArray(data.columns)) throw new Error("Invalid data");
          get()._saveHistory(data.columns);
          return true;
        } catch (e) {
          set({ error: "Failed to import board" });
          return false;
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "kanban-storage",
      skipHydration: true, // We will manually hydrate to avoid mismatch
    }
  )
);
