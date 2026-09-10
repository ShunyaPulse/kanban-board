"use client";

import { create } from "zustand";
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
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  selectedCard: CardWithSubtasks | null;
  showMetrics: boolean;

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
  importBoard: (data: unknown) => Promise<boolean>;
  setError: (error: string | null) => void;
}

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { data: null, error: body.error || `Request failed: ${res.status}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

function organizeBoard(
  columns: { id: string; title: string; position: number; wipLimit: number }[],
  cards: CardWithSubtasks[]
): ColumnWithCards[] {
  const columnMap = new Map<string, ColumnWithCards>();
  for (const col of columns) {
    columnMap.set(col.id, { ...col, cards: [] });
  }
  for (const card of cards) {
    const col = columnMap.get(card.columnId);
    if (col) {
      col.cards.push(card);
    }
  }
  columnMap.forEach((col) => {
    col.cards.sort((a: CardWithSubtasks, b: CardWithSubtasks) => a.position - b.position);
  });
  const result: ColumnWithCards[] = [];
  columnMap.forEach((col) => result.push(col));
  result.sort((a: ColumnWithCards, b: ColumnWithCards) => a.position - b.position);
  return result;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  metrics: null,
  undoStack: [],
  redoStack: [],
  isLoading: false,
  error: null,
  selectedCard: null,
  showMetrics: false,

  fetchBoard: async () => {
    set({ isLoading: true, error: null });
    const [colResult, cardResult] = await Promise.all([
      apiFetch<{ id: string; title: string; position: number; wipLimit: number }[]>(
        "/api/columns"
      ),
      apiFetch<CardWithSubtasks[]>("/api/cards"),
    ]);

    if (colResult.error || cardResult.error) {
      set({
        isLoading: false,
        error: colResult.error || cardResult.error,
      });
      return;
    }

    const columns = organizeBoard(colResult.data || [], cardResult.data || []);
    set({ columns, isLoading: false });
  },

  fetchMetrics: async () => {
    const { data } = await apiFetch<Metrics>("/api/metrics");
    if (data) set({ metrics: data });
  },

  fetchHistory: async () => {
    const { data } = await apiFetch<{
      undoStack: HistoryEntry[];
      redoStack: HistoryEntry[];
    }>("/api/history");
    if (data) {
      set({ undoStack: data.undoStack, redoStack: data.redoStack });
    }
  },

  createCard: async (title, columnId, description, priority) => {
    const { data, error } = await apiFetch<CardWithSubtasks>("/api/cards", {
      method: "POST",
      body: JSON.stringify({ title, columnId, description, priority }),
    });
    if (error) {
      set({ error });
      return null;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
    return data;
  },

  updateCard: async (id, updates) => {
    const { data, error } = await apiFetch<CardWithSubtasks>(`/api/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (error) {
      set({ error });
      return null;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    // Update selected card if it's the one being edited
    if (data && get().selectedCard?.id === id) {
      set({ selectedCard: data });
    }
    return data;
  },

  moveCard: async (id, targetColumnId, targetPosition) => {
    const { data, error } = await apiFetch<CardWithSubtasks>(`/api/cards/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ columnId: targetColumnId, position: targetPosition }),
    });
    if (error) {
      set({ error });
      return null;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
    return data;
  },

  deleteCard: async (id) => {
    const { error } = await apiFetch(`/api/cards/${id}`, { method: "DELETE" });
    if (error) {
      set({ error });
      return false;
    }
    if (get().selectedCard?.id === id) {
      set({ selectedCard: null });
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
    return true;
  },

  createSubtask: async (cardId, title) => {
    const { data, error } = await apiFetch<Subtask>(
      `/api/cards/${cardId}/subtasks`,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    );
    if (error) {
      set({ error });
      return null;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    // Refresh selected card
    if (get().selectedCard?.id === cardId) {
      const { data: card } = await apiFetch<CardWithSubtasks>(
        `/api/cards/${cardId}`
      );
      if (card) set({ selectedCard: card });
    }
    return data;
  },

  toggleSubtask: async (cardId, subtaskId) => {
    const { data, error } = await apiFetch<Subtask>(
      `/api/cards/${cardId}/subtasks/${subtaskId}`,
      { method: "PATCH" }
    );
    if (error) {
      set({ error });
      return null;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    // Refresh selected card
    if (get().selectedCard?.id === cardId) {
      const { data: card } = await apiFetch<CardWithSubtasks>(
        `/api/cards/${cardId}`
      );
      if (card) set({ selectedCard: card });
    }
    return data;
  },

  deleteSubtask: async (cardId, subtaskId) => {
    const { error } = await apiFetch(
      `/api/cards/${cardId}/subtasks/${subtaskId}`,
      { method: "DELETE" }
    );
    if (error) {
      set({ error });
      return false;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    // Refresh selected card
    if (get().selectedCard?.id === cardId) {
      const { data: card } = await apiFetch<CardWithSubtasks>(
        `/api/cards/${cardId}`
      );
      if (card) set({ selectedCard: card });
    }
    return true;
  },

  undo: async () => {
    const { error } = await apiFetch("/api/history/undo", { method: "POST" });
    if (error) {
      set({ error });
      return;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
  },

  redo: async () => {
    const { error } = await apiFetch("/api/history/redo", { method: "POST" });
    if (error) {
      set({ error });
      return;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
  },

  setSelectedCard: (card) => set({ selectedCard: card }),

  toggleMetrics: () => set((state) => ({ showMetrics: !state.showMetrics })),

  exportBoard: async () => {
    const { data, error } = await apiFetch<object>("/api/export");
    if (error) {
      set({ error });
      return null;
    }
    return JSON.stringify(data, null, 2);
  },

  importBoard: async (boardData) => {
    const { error } = await apiFetch("/api/import", {
      method: "POST",
      body: JSON.stringify(boardData),
    });
    if (error) {
      set({ error });
      return false;
    }
    await get().fetchBoard();
    await get().fetchHistory();
    await get().fetchMetrics();
    return true;
  },

  setError: (error) => set({ error }),
}));
