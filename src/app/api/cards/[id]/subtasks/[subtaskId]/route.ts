import { NextResponse } from 'next/server';
import { toggleSubtask, deleteSubtask } from '@/lib/db-operations';

export async function PATCH(request: Request, { params }: { params: { id: string; subtaskId: string } }) {
  try {
    const subtask = toggleSubtask(params.subtaskId);
    return NextResponse.json(subtask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; subtaskId: string } }) {
  try {
    deleteSubtask(params.subtaskId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
