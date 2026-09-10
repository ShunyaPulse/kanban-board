'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnWithCards } from '@/lib/types';
import Card from './Card';
import AddCardForm from './AddCardForm';

interface ColumnProps {
  column: ColumnWithCards;
}

export default function Column({ column }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  const cards = column.cards || [];
  const cardIds = cards.map((c) => c.id);
  const isOverLimit = column.wipLimit !== undefined && column.wipLimit > 0 && cards.length >= column.wipLimit;

  return (
    <div className={`flex flex-col glass-column rounded-2xl w-[85vw] sm:w-80 shrink-0 max-h-full ${isOverLimit ? 'ring-2 ring-red-500/80 bg-red-900/20' : ''}`}>
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center rounded-t-2xl z-10 shrink-0">
        <h3 className="font-semibold text-slate-200 flex items-center text-sm tracking-tight">
          {column.title}
          {isOverLimit && (
            <span className="ml-2 text-red-400 text-xs font-bold px-1.5 py-0.5 bg-red-900/50 rounded-full" title="WIP Limit Exceeded">
              !
            </span>
          )}
        </h3>
        <span className="bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-700 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
          {column.wipLimit && column.wipLimit > 0 ? `${cards.length}/${column.wipLimit}` : cards.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto min-h-[150px] flex flex-col gap-2"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} columnId={column.id} />
          ))}
        </SortableContext>
        <AddCardForm columnId={column.id} />
      </div>
    </div>
  );
}
