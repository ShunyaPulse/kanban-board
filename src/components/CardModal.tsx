"use client";

import React, { useState, useEffect } from "react";
import { useBoardStore } from "@/store/board-store";
import type { Priority } from "@/lib/types";

const priorities: Priority[] = ["low", "medium", "high", "critical"];

const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#9333ea",
};

export default function CardModal() {
  const selectedCard = useBoardStore((s) => s.selectedCard);
  const setSelectedCard = useBoardStore((s) => s.setSelectedCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const createSubtask = useBoardStore((s) => s.createSubtask);
  const toggleSubtask = useBoardStore((s) => s.toggleSubtask);
  const deleteSubtask = useBoardStore((s) => s.deleteSubtask);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedCard]);

  if (!selectedCard) return null;

  const card = selectedCard;
  const handleClose = () => setSelectedCard(null);

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.trim() && e.target.value !== card.title) {
      updateCard(card.id, { title: e.target.value.trim() });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const handleDescriptionBlur = (
    e: React.FocusEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value !== card.description) {
      updateCard(card.id, { description: e.target.value });
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      createSubtask(card.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const handleDeleteCard = () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id);
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all"
      onClick={handleClose}
    >
      <div
        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-5 border-b border-slate-700/50 bg-slate-800/50">
          <input
            type="text"
            defaultValue={card.title}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold text-slate-100 border-none bg-transparent focus:outline-none focus:ring-0 px-0 w-full placeholder-slate-500"
          />
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 ml-4 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-900/30">
          {/* Priority */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Priority
            </span>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => updateCard(card.id, { priority: p })}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                    card.priority === p
                      ? "ring-2 ring-offset-2 ring-offset-slate-900 shadow-sm"
                      : "opacity-60 hover:opacity-100 hover:bg-slate-800"
                  }`}
                  style={{
                    backgroundColor: `${priorityColors[p]}20`,
                    color: priorityColors[p],
                    borderColor:
                      card.priority === p
                        ? priorityColors[p]
                        : "transparent",
                    ...(card.priority === p
                      ? { ringColor: priorityColors[p] }
                      : {}),
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Description
            </h4>
            <textarea
              defaultValue={card.description || ""}
              onBlur={handleDescriptionBlur}
              placeholder="Add a more detailed description..."
              className="w-full bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-xl shadow-sm focus:ring-blue-500/50 focus:border-blue-500/50 text-sm min-h-[120px] p-4 transition-colors placeholder-slate-500"
            />
          </div>

          {/* Subtasks */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Subtasks <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs ml-2">{card.subtasks?.filter((s) => s.completed).length || 0} / {card.subtasks?.length || 0}</span>
            </h4>
            <div className="space-y-2 mb-4 bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 shadow-sm">
              {card.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center space-x-3 group p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(card.id, st.id)}
                    className="rounded-md border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 h-4.5 w-4.5 cursor-pointer transition-colors"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      st.completed
                        ? "line-through text-slate-500"
                        : "text-slate-200 font-medium"
                    }`}
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(card.id, st.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm px-2 py-1 hover:bg-red-900/30 rounded-md"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(!card.subtasks || card.subtasks.length === 0) && (
                <div className="text-sm text-slate-500 p-2 italic text-center">No subtasks yet</div>
              )}
            </div>
            <form onSubmit={handleAddSubtask} className="flex space-x-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new subtask..."
                className="flex-1 bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-lg shadow-sm focus:ring-blue-500/50 focus:border-blue-500/50 text-sm p-2.5 transition-colors placeholder-slate-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors shadow-sm"
              >
                Add
              </button>
            </form>
          </div>

          {/* Metadata */}
          <div className="pt-6 border-t border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Metadata
            </h4>
            <div className="flex gap-4 text-xs font-medium text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30">
              <div>
                <span className="block text-slate-500 mb-1">Created</span>
                {new Date(card.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="block text-slate-500 mb-1">Last Moved</span>
                {new Date(card.movedAt).toLocaleDateString()}
              </div>
              {card.completedAt && (
                <div>
                  <span className="block text-slate-500 mb-1">Completed</span>
                  {new Date(card.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-800/80 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={handleDeleteCard}
            className="text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete Card
          </button>
          <button
            onClick={handleClose}
            className="bg-slate-700 border border-slate-600 text-slate-200 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-600 shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
