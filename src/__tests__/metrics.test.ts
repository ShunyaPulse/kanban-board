import { describe, it, expect } from "vitest";

// Metrics calculation logic tests
// We test the pure computation logic independently of the database

interface CompletedCard {
  createdAt: string;
  completedAt: string;
}

interface ThroughputEntry {
  date: string;
  count: number;
}

interface WipAlert {
  columnId: string;
  columnTitle: string;
  current: number;
  limit: number;
}

function calculateAverageLeadTime(cards: CompletedCard[]): number | null {
  if (cards.length === 0) return null;
  let totalHours = 0;
  for (const card of cards) {
    const start = new Date(card.createdAt).getTime();
    const end = new Date(card.completedAt).getTime();
    totalHours += (end - start) / (1000 * 60 * 60);
  }
  return totalHours / cards.length;
}

function calculateThroughput(
  cards: CompletedCard[],
  days: number = 30
): ThroughputEntry[] {
  const throughputMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    throughputMap.set(dateStr, 0);
  }

  for (const card of cards) {
    const dateStr = card.completedAt.split("T")[0];
    if (throughputMap.has(dateStr)) {
      throughputMap.set(dateStr, throughputMap.get(dateStr)! + 1);
    }
  }

  const result: ThroughputEntry[] = [];
  throughputMap.forEach((count, date) => {
    result.push({ date, count });
  });
  return result;
}

function detectWipAlerts(
  columns: { id: string; title: string; wipLimit: number; cardCount: number }[]
): WipAlert[] {
  return columns
    .filter((col) => col.wipLimit > 0 && col.cardCount >= col.wipLimit)
    .map((col) => ({
      columnId: col.id,
      columnTitle: col.title,
      current: col.cardCount,
      limit: col.wipLimit,
    }));
}

describe("Metrics Calculations", () => {
  describe("Average Lead Time", () => {
    it("should return null for no completed cards", () => {
      expect(calculateAverageLeadTime([])).toBeNull();
    });

    it("should calculate lead time for a single card", () => {
      const cards: CompletedCard[] = [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          completedAt: "2024-01-02T00:00:00.000Z",
        },
      ];
      const result = calculateAverageLeadTime(cards);
      expect(result).toBe(24); // 24 hours = 1 day
    });

    it("should calculate average lead time for multiple cards", () => {
      const cards: CompletedCard[] = [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          completedAt: "2024-01-02T00:00:00.000Z",
        },
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          completedAt: "2024-01-03T00:00:00.000Z",
        },
      ];
      const result = calculateAverageLeadTime(cards);
      expect(result).toBe(36); // (24 + 48) / 2
    });

    it("should handle sub-hour lead times", () => {
      const cards: CompletedCard[] = [
        {
          createdAt: "2024-01-01T00:00:00.000Z",
          completedAt: "2024-01-01T00:30:00.000Z",
        },
      ];
      const result = calculateAverageLeadTime(cards);
      expect(result).toBe(0.5); // 30 minutes = 0.5 hours
    });
  });

  describe("Throughput", () => {
    it("should generate entries for the specified number of days", () => {
      const result = calculateThroughput([], 7);
      expect(result).toHaveLength(7);
    });

    it("should count zero for days with no completions", () => {
      const result = calculateThroughput([], 7);
      for (const entry of result) {
        expect(entry.count).toBe(0);
      }
    });

    it("should count completions on matching days", () => {
      const today = new Date().toISOString();
      const cards: CompletedCard[] = [
        { createdAt: "2024-01-01T00:00:00.000Z", completedAt: today },
        { createdAt: "2024-01-01T00:00:00.000Z", completedAt: today },
      ];

      const result = calculateThroughput(cards, 7);
      const todayStr = new Date().toISOString().split("T")[0];
      const todayEntry = result.find((e) => e.date === todayStr);
      expect(todayEntry).toBeDefined();
      expect(todayEntry!.count).toBe(2);
    });

    it("should not count completions outside the window", () => {
      const oldDate = "2020-01-01T00:00:00.000Z";
      const cards: CompletedCard[] = [
        { createdAt: "2020-01-01T00:00:00.000Z", completedAt: oldDate },
      ];

      const result = calculateThroughput(cards, 7);
      const total = result.reduce((sum, e) => sum + e.count, 0);
      expect(total).toBe(0);
    });
  });

  describe("WIP Bottleneck Detection", () => {
    it("should return no alerts when all columns are under limit", () => {
      const columns = [
        { id: "1", title: "In Progress", wipLimit: 3, cardCount: 2 },
        { id: "2", title: "Review", wipLimit: 2, cardCount: 1 },
      ];
      expect(detectWipAlerts(columns)).toHaveLength(0);
    });

    it("should return alert when column reaches WIP limit", () => {
      const columns = [
        { id: "1", title: "In Progress", wipLimit: 3, cardCount: 3 },
      ];
      const alerts = detectWipAlerts(columns);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].columnTitle).toBe("In Progress");
      expect(alerts[0].current).toBe(3);
      expect(alerts[0].limit).toBe(3);
    });

    it("should return alert when column exceeds WIP limit", () => {
      const columns = [
        { id: "1", title: "In Progress", wipLimit: 3, cardCount: 5 },
      ];
      const alerts = detectWipAlerts(columns);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].current).toBe(5);
    });

    it("should ignore columns with no WIP limit (limit = 0)", () => {
      const columns = [
        { id: "1", title: "To Do", wipLimit: 0, cardCount: 100 },
        { id: "2", title: "Done", wipLimit: 0, cardCount: 50 },
      ];
      expect(detectWipAlerts(columns)).toHaveLength(0);
    });

    it("should return multiple alerts for multiple columns", () => {
      const columns = [
        { id: "1", title: "In Progress", wipLimit: 3, cardCount: 4 },
        { id: "2", title: "Review", wipLimit: 2, cardCount: 3 },
        { id: "3", title: "To Do", wipLimit: 0, cardCount: 10 },
      ];
      const alerts = detectWipAlerts(columns);
      expect(alerts).toHaveLength(2);
    });
  });
});
