import { NextResponse } from 'next/server';
import { redo } from '@/lib/history-engine';

export async function POST() {
  try {
    const entry = redo();
    if (!entry) {
      return NextResponse.json({ error: 'Nothing to redo' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
