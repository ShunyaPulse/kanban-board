"use client";

import React from "react";
import Board from "@/components/Board";
import MetricsPanel from "@/components/MetricsPanel";
import CardModal from "@/components/CardModal";
import UndoRedoControls from "@/components/UndoRedoControls";
import ImportExport from "@/components/ImportExport";
import InstallPwaButton from "@/components/InstallPwaButton";
import { useBoardStore } from "@/store/board-store";

export default function Home() {
  const toggleMetrics = useBoardStore((s) => s.toggleMetrics);

  return (
    <main className="flex-1 flex flex-col font-sans overflow-hidden bg-transparent">
      <header className="glass-header px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 z-10 shrink-0 sticky top-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight mr-4 sm:mr-6">
            Kanban
          </h1>
          <UndoRedoControls />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
          <InstallPwaButton />
          <button
            onClick={toggleMetrics}
            className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-xl hover:bg-slate-700 transition-all shadow-sm backdrop-blur-sm"
          >
            📊 Metrics
          </button>
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
          <ImportExport />
          <a
            href="https://github.com/ShunyaPulse/kanban-board"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-700/60 transition-all backdrop-blur-sm"
            title="View on GitHub"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </div>
      </header>

      <Board />
      <MetricsPanel />
      <CardModal />
    </main>
  );
}
