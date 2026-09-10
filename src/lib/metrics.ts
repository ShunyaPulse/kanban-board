import db from "@/lib/db";
import type { Metrics } from "@/lib/types";

export function calculateMetrics(): Metrics {
  // Average Lead Time
  const completedCards = db
    .prepare(
      "SELECT created_at, completed_at FROM cards WHERE completed_at IS NOT NULL"
    )
    .all() as { created_at: string; completed_at: string }[];

  let totalHours = 0;
  for (const card of completedCards) {
    const start = new Date(card.created_at).getTime();
    const end = new Date(card.completed_at).getTime();
    totalHours += (end - start) / (1000 * 60 * 60);
  }
  const averageLeadTime =
    completedCards.length > 0 ? totalHours / completedCards.length : null;

  // Throughput — last 30 days
  const throughputMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    throughputMap.set(dateStr, 0);
  }

  for (const card of completedCards) {
    const dateStr = card.completed_at.split("T")[0];
    if (throughputMap.has(dateStr)) {
      throughputMap.set(dateStr, throughputMap.get(dateStr)! + 1);
    }
  }
  const throughput = Array.from(throughputMap.entries()).map(
    ([date, count]) => ({ date, count })
  );

  // WIP Alerts
  const columnsWithLimits = db
    .prepare("SELECT id, title, wip_limit FROM columns WHERE wip_limit > 0")
    .all() as { id: string; title: string; wip_limit: number }[];

  const wipAlerts: {
    columnId: string;
    columnTitle: string;
    current: number;
    limit: number;
  }[] = [];

  for (const col of columnsWithLimits) {
    const countRes = db
      .prepare("SELECT COUNT(*) as count FROM cards WHERE column_id = ?")
      .get(col.id) as { count: number };
    if (countRes.count >= col.wip_limit) {
      wipAlerts.push({
        columnId: col.id,
        columnTitle: col.title,
        current: countRes.count,
        limit: col.wip_limit,
      });
    }
  }

  // Column Distribution
  const allColumns = db
    .prepare("SELECT id, title FROM columns ORDER BY position ASC")
    .all() as { id: string; title: string }[];

  const columnDistribution: {
    columnId: string;
    title: string;
    count: number;
  }[] = [];

  for (const col of allColumns) {
    const countRes = db
      .prepare("SELECT COUNT(*) as count FROM cards WHERE column_id = ?")
      .get(col.id) as { count: number };
    columnDistribution.push({
      columnId: col.id,
      title: col.title,
      count: countRes.count,
    });
  }

  // Total & Completed
  const totalCards = (
    db.prepare("SELECT COUNT(*) as count FROM cards").get() as {
      count: number;
    }
  ).count;
  const completedCount = completedCards.length;

  return {
    averageLeadTime,
    throughput,
    wipAlerts,
    columnDistribution,
    totalCards,
    completedCards: completedCount,
  };
}
