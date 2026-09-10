# Collaborative Kanban Board

A modern, production-ready Kanban Board with a state-machine Undo/Redo engine, real-time lead time & throughput analytics, custom WIP limits, and JSON schema-validated export/import.

![Kanban Board](https://raw.githubusercontent.com/ShunyaPulse/kanban-board/main/public/preview.png)

## 🚀 Features

- **Intuitive Column & Card Management**: Drag-and-drop powered by `@dnd-kit` across columns (`To Do`, `In Progress`, `Review`, `Done`).
- **WIP Limits & Bottleneck Alerts**: Set customizable Work-In-Progress limits per column with real-time visual alerts when limits are exceeded.
- **Robust Undo/Redo Engine**: Full state machine history stack supporting `Ctrl+Z` and `Ctrl+Y` keyboard shortcuts for card moves, creation, editing, and deletion.
- **Real-Time Analytics Panel**:
  - Average Lead Time (duration from creation to completion).
  - Throughput (14-day completion velocity bar chart).
  - Active WIP limit warnings and column distribution.
- **Interactive Cards**: Subtask checklists with progress tracking, priority badges (`Low`, `Medium`, `High`, `Critical`), rich markdown descriptions, and timestamps.
- **Export & Import**: Full board backup and restore in JSON with strict Zod schema validation.
- **Modern Aesthetic**: Calm dark mode with subtle glassmorphic styling, smooth easing micro-interactions, and accessible typography.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Persistence**: SQLite (`better-sqlite3` with WAL mode & foreign keys)
- **Validation**: Zod
- **Testing**: Vitest (45 unit & integration tests)

## 📦 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ShunyaPulse/kanban-board.git
cd kanban-board
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Tests

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```
