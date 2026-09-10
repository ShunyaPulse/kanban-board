export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Column {
  id: string;
  title: string;
  position: number;
  wipLimit: number;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  columnId: string;
  position: number;
  createdAt: string; // ISO timestamp
  movedAt: string;   // ISO timestamp - when card was last moved
  completedAt: string | null; // ISO timestamp - when card reached Done
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  cardId: string;
  position: number;
}

export interface CardWithSubtasks extends Card {
  subtasks: Subtask[];
}

export interface ColumnWithCards extends Column {
  cards: CardWithSubtasks[];
}

export type ActionType = 'create_card' | 'move_card' | 'edit_card' | 'delete_card' | 'toggle_subtask' | 'create_subtask' | 'delete_subtask' | 'edit_column';

export interface HistoryEntry {
  id: string;
  actionType: ActionType;
  entityType: 'card' | 'subtask' | 'column';
  entityId: string;
  previousState: string; // JSON stringified
  newState: string;      // JSON stringified
  description: string;   // Human-readable description
  timestamp: string;
}

export interface BoardData {
  columns: Column[];
  cards: CardWithSubtasks[];
  exportedAt: string;
  version: string;
}

export interface Metrics {
  averageLeadTime: number | null; // in hours
  throughput: { date: string; count: number }[];
  wipAlerts: { columnId: string; columnTitle: string; current: number; limit: number }[];
  columnDistribution: { columnId: string; title: string; count: number }[];
  totalCards: number;
  completedCards: number;
}
