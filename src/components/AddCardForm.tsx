"use client";

import React, { useState, useRef, useEffect } from "react";
import { useBoardStore } from "@/store/board-store";

export default function AddCardForm({ columnId }: { columnId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createCard = useBoardStore((s) => s.createCard);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const result = await createCard(title.trim(), columnId);
    if (result) {
      setTitle("");
      setIsExpanded(false);
      setError(null);
    } else {
      setError("Failed to create card (WIP limit may be exceeded)");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setTitle("");
      setError(null);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full text-left py-2.5 px-3 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center mt-2 group"
      >
        <span className="mr-2 text-lg font-normal group-hover:scale-110 transition-transform">+</span> Add card
      </button>
    );
  }

  return (
    <div className="p-3 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-700/60 mt-2 transition-all">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        className="w-full p-2 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-700 focus:bg-slate-800 transition-colors placeholder-slate-400"
      />
      {error && <div className="text-red-400 text-xs mt-1.5 font-medium">{error}</div>}
      <div className="flex items-center mt-3 space-x-2">
        <button
          onClick={() => handleSubmit()}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
        >
          Add
        </button>
        <button
          onClick={() => {
            setIsExpanded(false);
            setTitle("");
            setError(null);
          }}
          className="px-4 py-1.5 text-slate-400 text-sm font-semibold hover:bg-slate-700 hover:text-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
