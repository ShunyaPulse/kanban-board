import { NextResponse } from 'next/server';
import { undo } from '@/lib/history-engine';

export async function POST() {
  try {
    const entry = undo();
    if (!entry) {
      return NextResponse.json({ error: 'Nothing to undo' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
