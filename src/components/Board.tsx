"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useBoardStore } from "@/store/board-store";
import type { CardWithSubtasks } from "@/lib/types";
import Column from "./Column";
import CardComponent from "./Card";

export default function Board() {
  const columns = useBoardStore((s) => s.columns);
  const isLoading = useBoardStore((s) => s.isLoading);
  const error = useBoardStore((s) => s.error);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const fetchHistory = useBoardStore((s) => s.fetchHistory);
  const moveCard = useBoardStore((s) => s.moveCard);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const setError = useBoardStore((s) => s.setError);

  const [activeCard, setActiveCard] = useState<CardWithSubtasks | null>(null);

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    useBoardStore.persist.rehydrate();
    setHasHydrated(true);
    fetchBoard();
  }, [fetchBoard]);

  // Auto-dismiss errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findCard = useCallback(
    (cardId: string): CardWithSubtasks | null => {
      for (const col of columns) {
        const card = col.cards.find((c) => c.id === cardId);
        if (card) return card;
      }
      return null;
    },
    [columns]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = findCard(event.active.id as string);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentCard = activeCard;
    setActiveCard(null);

    if (!over || !currentCard) return;

    const overData = over.data.current;
    let targetColumnId: string;
    let targetIndex: number;

    if (overData?.type === "column") {
      targetColumnId = over.id as string;
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn ? targetColumn.cards.length : 0;
    } else if (overData?.type === "card") {
      targetColumnId = overData.columnId;
      const targetColumn = columns.find((c) => c.id === targetColumnId);
      targetIndex = targetColumn
        ? targetColumn.cards.findIndex((c) => c.id === over.id)
        : 0;
    } else {
      return;
    }

    const sourceColumnId = currentCard.columnId;
    if (
      sourceColumnId === targetColumnId &&
      currentCard.position === targetIndex
    ) {
      return;
    }

    moveCard(active.id as string, targetColumnId, targetIndex);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.4" } },
    }),
  };

  if (!hasHydrated || (isLoading && columns.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-transparent flex flex-col h-full">
      {error && (
        <div className="fixed top-20 right-4 bg-red-900/40 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl z-50 shadow-lg font-medium text-sm">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 sm:gap-6 h-full items-start pb-4">
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeCard ? (
            <CardComponent
              card={activeCard}
              columnId={activeCard.columnId}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
