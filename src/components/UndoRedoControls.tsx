'use client';

import React from 'react';
import { useBoardStore } from '@/store/board-store';

export default function UndoRedoControls() {
  const { undo, redo, undoStack, redoStack } = useBoardStore();

  return (
    <div className="flex items-center space-x-3">
      <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-700/60 p-0.5">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
          className={`relative px-3 py-1.5 text-sm font-semibold flex items-center justify-center rounded-lg transition-all duration-200 ${
            undoStack.length === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <span className="mr-1.5 text-lg leading-none">↶</span> Undo
          {undoStack.length > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-slate-800">
              {undoStack.length}
            </span>
          )}
        </button>
        <div className="w-px bg-slate-700 my-1 mx-0.5" />
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
          className={`relative px-3 py-1.5 text-sm font-semibold flex items-center justify-center rounded-lg transition-all duration-200 ${
            redoStack.length === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          Redo <span className="ml-1.5 text-lg leading-none">↷</span>
          {redoStack.length > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-slate-800">
              {redoStack.length}
            </span>
          )}
        </button>
      </div>
      <span className="text-xs text-slate-500 hidden md:inline-block font-mono bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700">
        Ctrl+Z / Ctrl+Y
      </span>
    </div>
  );
}
