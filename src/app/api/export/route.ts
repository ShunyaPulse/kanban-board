import { NextResponse } from 'next/server';
import { getColumns, getCards } from '@/lib/db-operations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const columns = getColumns();
    const cards = getCards();
    
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      columns,
      cards,
    };
    
    return NextResponse.json(exportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
