"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardWithSubtasks } from "@/lib/types";
import { useBoardStore } from "@/store/board-store";

interface CardProps {
  card: CardWithSubtasks;
  columnId: string;
}

const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#9333ea",
};

export default function CardComponent({ card, columnId }: CardProps) {
  const setSelectedCard = useBoardStore((state) => state.setSelectedCard);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completedSubtasks =
    card.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;
  const color = priorityColors[card.priority] || priorityColors.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedCard(card)}
      className={`relative bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/80 p-4 cursor-grab hover:-translate-y-0.5 transition-all duration-200 flex flex-col group select-none ${
        isDragging ? "shadow-2xl border-blue-500/50 rotate-2 scale-105" : "card-shadow hover:card-shadow-hover"
      }`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl opacity-80"
        style={{ backgroundColor: color }}
      />
      <div className="pl-2">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-semibold text-slate-100 break-words leading-tight">
            {card.title}
          </h4>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-2 shrink-0"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {card.priority}
          </span>
        </div>

        {card.description && (
          <p className="text-[13px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {card.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="mt-auto pt-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              <span>Tasks</span>
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden ring-1 ring-inset ring-black/20">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    totalSubtasks === 0
                      ? 0
                      : (completedSubtasks / totalSubtasks) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
