import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/history-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
