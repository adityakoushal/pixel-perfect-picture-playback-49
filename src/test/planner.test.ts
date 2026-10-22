import { beforeEach, describe, expect, it } from "vitest";

import { allocateBudget, buildBudget, budgetTotals, categoryWeights } from "@/features/budget/allocate";
import { taskProgress, toggleTask } from "@/features/checklist/tasks";
import { assemblePlan } from "@/features/event-planner/build-plan";
import { generateDemoContent } from "@/features/event-planner/demo-engine";
import { makeEventSchema, type EventDetails } from "@/schemas/event";
import { parsePlanContent } from "@/schemas/plan";
import { mapGatewayStatus, statusFromError } from "@/services/ai-errors";
import { deletePlan, getPlan, listPlans, savePlan, STORAGE_KEY } from "@/services/plan-storage";

const schema = makeEventSchema(() => new Date("2026-10-22T10:00:00"));
const valid = {
  name: "Aanya's 30th", type: "Birthday", date: "2026-12-12", location: "Jaipur", guests: "80",
  budget: "250000", currency: "INR", style: "Elegant", venue: "Indoor", food: "Mixed", requirements: "", notes: "",
};
const details = schema.parse(valid) as EventDetails;

describe("form validation", () => {
  it("accepts valid details and coerces numbers", () => {
    expect(details.guests).toBe(80);
    expect(details.budget).toBe(250000);
  });
  it("rejects a past date", () => {
    expect(schema.safeParse({ ...valid, date: "2026-10-21" }).success).toBe(false);
  });
  it("accepts today", () => {
    expect(schema.safeParse({ ...valid, date: "2026-10-22" }).success).toBe(true);
  });
  it("rejects zero, fractional and negative guests", () => {
    for (const g of ["0", "2.5", "-4"]) expect(schema.safeParse({ ...valid, guests: g }).success).toBe(false);
  });
  it("rejects negative or zero budget", () => {
    expect(schema.safeParse({ ...valid, budget: "-100" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, budget: "0" }).success).toBe(false);
  });
});

describe("budget allocation", () => {
  it("amounts sum exactly to the total for awkward totals", () => {
    for (const total of [1, 7, 999, 100001, 123457]) {
      const lines = allocateBudget(total, categoryWeights("Wedding", "Hotel"));
      expect(lines.reduce((a, l) => a + l.amount, 0)).toBe(total);
    }
  });
  it("keeps 10% contingency for a birthday", () => {
    const lines = buildBudget({ budget: 100000, type: "Birthday", venue: "Indoor" });
    expect(lines.find((l) => l.key === "contingency")?.amount).toBe(10000);
  });
  it("home venues allocate only 5% to venue", () => {
    const lines = buildBudget({ budget: 100000, type: "Wedding", venue: "Home" });
    expect(lines.find((l) => l.key === "venue")?.percent).toBe(5);
  });
  it("remaining = planned - spent", () => {
    const lines = buildBudget({ budget: 1000, type: "Other", venue: "Indoor" }).map((l, i) => (i === 0 ? { ...l, spent: 300 } : l));
    expect(budgetTotals(lines)).toEqual({ planned: 1000, spent: 300, remaining: 700 });
  });
});

describe("tasks", () => {
  it("toggling updates progress", () => {
    const plan = assemblePlan("x", details, generateDemoContent(details), "demo");
    const total = plan.tasks.length;
    const toggled = toggleTask(plan.tasks, plan.tasks[0]!.id);
    expect(taskProgress(toggled).done).toBe(1);
    expect(taskProgress(toggleTask(toggled, plan.tasks[0]!.id)).done).toBe(0);
    expect(taskProgress(toggled).total).toBe(total);
  });
  it("empty list is 0%", () => expect(taskProgress([]).percent).toBe(0));
});

describe("storage", () => {
  beforeEach(() => localStorage.clear());
  it("saves, reopens and deletes plans", () => {
    const plan = assemblePlan("p1", details, generateDemoContent(details), "demo");
    savePlan(plan);
    expect(getPlan("p1")?.details.name).toBe("Aanya's 30th");
    expect(listPlans()).toHaveLength(1);
    deletePlan("p1");
    expect(getPlan("p1")).toBeNull();
  });
  it("ignores corrupt storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(listPlans()).toEqual([]);
  });
});

describe("AI response validation", () => {
  it("accepts demo-shaped content", () => {
    expect(parsePlanContent(generateDemoContent(details))).not.toBeNull();
  });
  it("rejects malformed output", () => {
    expect(parsePlanContent({ overview: "nope" })).toBeNull();
  });
  it("drops invalid palette colours", () => {
    const c = generateDemoContent(details);
    c.overview.palette.push({ name: "Bad", hex: "red" });
    expect(parsePlanContent(c)?.overview.palette.some((p) => p.hex === "red")).toBe(false);
  });
});

describe("API error handling", () => {
  it("429 is retryable, 402 is not", () => {
    expect(mapGatewayStatus(429)).toMatchObject({ code: "rate_limited", retryable: true });
    expect(mapGatewayStatus(402)).toMatchObject({ code: "credits", retryable: false });
  });
  it("finds nested status codes", () => {
    expect(statusFromError({ lastError: { statusCode: 429 } })).toBe(429);
  });
});
