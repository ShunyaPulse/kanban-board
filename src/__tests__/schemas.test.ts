import { describe, it, expect } from "vitest";
import {
  BoardDataSchema,
  CreateCardSchema,
  UpdateCardSchema,
  MoveCardSchema,
  CreateSubtaskSchema,
  UpdateColumnSchema,
  PrioritySchema,
} from "@/lib/schemas";

describe("Schema Validation", () => {
  describe("PrioritySchema", () => {
    it("should accept valid priorities", () => {
      expect(PrioritySchema.parse("low")).toBe("low");
      expect(PrioritySchema.parse("medium")).toBe("medium");
      expect(PrioritySchema.parse("high")).toBe("high");
      expect(PrioritySchema.parse("critical")).toBe("critical");
    });

    it("should reject invalid priorities", () => {
      expect(() => PrioritySchema.parse("urgent")).toThrow();
      expect(() => PrioritySchema.parse("")).toThrow();
      expect(() => PrioritySchema.parse(123)).toThrow();
    });
  });

  describe("CreateCardSchema", () => {
    it("should accept valid card creation data", () => {
      const data = {
        title: "My Card",
        columnId: "123e4567-e89b-12d3-a456-426614174000",
      };
      const result = CreateCardSchema.parse(data);
      expect(result.title).toBe("My Card");
      expect(result.columnId).toBe("123e4567-e89b-12d3-a456-426614174000");
    });

    it("should accept optional description and priority", () => {
      const data = {
        title: "My Card",
        columnId: "test-col-id",
        description: "A description",
        priority: "high" as const,
      };
      const result = CreateCardSchema.parse(data);
      expect(result.description).toBe("A description");
      expect(result.priority).toBe("high");
    });

    it("should reject empty title", () => {
      const data = { title: "", columnId: "test-col-id" };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it("should reject missing title", () => {
      const data = { columnId: "test-col-id" };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });

    it("should reject missing columnId", () => {
      const data = { title: "My Card" };
      expect(() => CreateCardSchema.parse(data)).toThrow();
    });
  });

  describe("UpdateCardSchema", () => {
    it("should accept partial updates", () => {
      expect(UpdateCardSchema.parse({ title: "New Title" })).toEqual({
        title: "New Title",
      });
      expect(UpdateCardSchema.parse({ priority: "low" })).toEqual({
        priority: "low",
      });
      expect(UpdateCardSchema.parse({ description: "New desc" })).toEqual({
        description: "New desc",
      });
    });

    it("should accept empty update (all optional)", () => {
      expect(UpdateCardSchema.parse({})).toEqual({});
    });

    it("should reject invalid priority in update", () => {
      expect(() =>
        UpdateCardSchema.parse({ priority: "invalid" })
      ).toThrow();
    });
  });

  describe("MoveCardSchema", () => {
    it("should accept valid move data", () => {
      const data = { columnId: "col-123", position: 0 };
      const result = MoveCardSchema.parse(data);
      expect(result.columnId).toBe("col-123");
      expect(result.position).toBe(0);
    });

    it("should reject negative position", () => {
      const data = { columnId: "col-123", position: -1 };
      expect(() => MoveCardSchema.parse(data)).toThrow();
    });

    it("should reject missing position", () => {
      const data = { columnId: "col-123" };
      expect(() => MoveCardSchema.parse(data)).toThrow();
    });
  });

  describe("CreateSubtaskSchema", () => {
    it("should accept valid subtask title", () => {
      const result = CreateSubtaskSchema.parse({ title: "My subtask" });
      expect(result.title).toBe("My subtask");
    });

    it("should reject empty title", () => {
      expect(() => CreateSubtaskSchema.parse({ title: "" })).toThrow();
    });
  });

  describe("UpdateColumnSchema", () => {
    it("should accept valid column updates", () => {
      const result = UpdateColumnSchema.parse({
        title: "New Title",
        wipLimit: 5,
      });
      expect(result.title).toBe("New Title");
      expect(result.wipLimit).toBe(5);
    });

    it("should accept zero WIP limit (unlimited)", () => {
      const result = UpdateColumnSchema.parse({ wipLimit: 0 });
      expect(result.wipLimit).toBe(0);
    });

    it("should reject negative WIP limit", () => {
      expect(() =>
        UpdateColumnSchema.parse({ wipLimit: -1 })
      ).toThrow();
    });
  });

  describe("BoardDataSchema", () => {
    it("should accept valid board export data", () => {
      const data = {
        columns: [
          { id: "col-1", title: "To Do", position: 0, wipLimit: 0 },
        ],
        cards: [
          {
            id: "card-1",
            title: "Test Card",
            description: "Desc",
            priority: "medium",
            columnId: "col-1",
            position: 0,
            createdAt: "2024-01-01T00:00:00.000Z",
            movedAt: "2024-01-01T00:00:00.000Z",
            completedAt: null,
            subtasks: [
              {
                id: "st-1",
                title: "Subtask 1",
                completed: false,
                cardId: "card-1",
                position: 0,
              },
            ],
          },
        ],
        exportedAt: "2024-01-01T00:00:00.000Z",
        version: "1.0.0",
      };

      const result = BoardDataSchema.parse(data);
      expect(result.columns).toHaveLength(1);
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].subtasks).toHaveLength(1);
    });

    it("should reject board data without version", () => {
      const data = {
        columns: [],
        cards: [],
        exportedAt: "2024-01-01T00:00:00.000Z",
      };
      expect(() => BoardDataSchema.parse(data)).toThrow();
    });

    it("should reject board data with invalid card", () => {
      const data = {
        columns: [],
        cards: [{ id: "card-1" }], // Missing required fields
        exportedAt: "2024-01-01T00:00:00.000Z",
        version: "1.0.0",
      };
      expect(() => BoardDataSchema.parse(data)).toThrow();
    });
  });
});
