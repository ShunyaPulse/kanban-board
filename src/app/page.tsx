"use client";

import React from "react";
import Board from "@/components/Board";
import MetricsPanel from "@/components/MetricsPanel";
import CardModal from "@/components/CardModal";
import UndoRedoControls from "@/components/UndoRedoControls";
import ImportExport from "@/components/ImportExport";
import { useBoardStore } from "@/store/board-store";

export default function Home() {
  const toggleMetrics = useBoardStore((s) => s.toggleMetrics);

  return (
    <main className="h-screen flex flex-col font-sans overflow-hidden bg-transparent">
      <header className="glass-header px-6 py-4 flex justify-between items-center z-10 shrink-0 sticky top-0">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Kanban Board
          </h1>
          <UndoRedoControls />
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMetrics}
            className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-xl hover:bg-slate-700 transition-all shadow-sm backdrop-blur-sm"
          >
            📊 Metrics
          </button>
          <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
          <ImportExport />
        </div>
      </header>

      <Board />
      <MetricsPanel />
      <CardModal />
    </main>
  );
}
