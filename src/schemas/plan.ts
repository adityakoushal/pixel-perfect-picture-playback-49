import { z } from "zod";
import { eventSchema } from "./event";

/**
 * Creative plan content. This is the shape the AI must return (strict schema:
 * all fields required, no optional keys) and the demo engine also produces.
 * Budget numbers are NOT part of it — they're always computed in code.
 */
export const TASK_GROUPS = [
  "Planning",
  "Venue and vendors",
  "Food and decoration",
  "Invitations",
  "Event day",
  "Post-event",
] as const;

const str = z.string();

export const planContentSchema = z.object({
  overview: z.object({
    concept: str,
    theme: str,
    decorationStyle: str,
    venueIdeas: str,
    ambience: str,
    palette: z.array(z.object({ name: str, hex: str })),
  }),
  timeline: z.array(z.object({ time: str, activity: str, notes: str })),
  tasks: z.array(z.object({ group: z.enum(TASK_GROUPS), title: str })),
  vendors: z.array(
    z.object({ category: str, criteria: z.array(str), questions: z.array(str) }),
  ),
  comparisonChecklist: z.array(str),
  ideas: z.object({
    themes: z.array(str),
    decor: z.array(str),
    activities: z.array(str),
    food: z.array(str),
    entertainment: z.array(str),
    savings: z.array(str),
  }),
  risks: z.array(z.object({ risk: str, backup: str })),
});

export type PlanContent = z.infer<typeof planContentSchema>;

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Validates untrusted (AI) output and normalises it: trims arrays to sensible
 * sizes, drops empty strings and invalid colours. Returns null if unusable.
 */
export function parsePlanContent(input: unknown): PlanContent | null {
  const parsed = planContentSchema.safeParse(input);
  if (!parsed.success) return null;
  const c = parsed.data;
  const clean = (a: string[], n: number) =>
    a.map((s) => s.trim()).filter(Boolean).slice(0, n);
  const out: PlanContent = {
    overview: { ...c.overview, palette: c.overview.palette.filter((p) => HEX.test(p.hex)).slice(0, 6) },
    timeline: c.timeline.filter((t) => t.activity.trim()).slice(0, 20),
    tasks: c.tasks.filter((t) => t.title.trim()).slice(0, 48),
    vendors: c.vendors.slice(0, 10).map((v) => ({
      category: v.category,
      criteria: clean(v.criteria, 6),
      questions: clean(v.questions, 6),
    })),
    comparisonChecklist: clean(c.comparisonChecklist, 12),
    ideas: {
      themes: clean(c.ideas.themes, 6),
      decor: clean(c.ideas.decor, 6),
      activities: clean(c.ideas.activities, 6),
      food: clean(c.ideas.food, 6),
      entertainment: clean(c.ideas.entertainment, 6),
      savings: clean(c.ideas.savings, 8),
    },
    risks: c.risks.filter((r) => r.risk.trim()).slice(0, 10),
  };
  if (!out.overview.concept.trim() || out.timeline.length === 0 || out.tasks.length === 0) {
    return null;
  }
  return out;
}

export const budgetLineSchema = z.object({
  key: z.string(),
  label: z.string(),
  amount: z.number(),
  percent: z.number(),
  spent: z.number().default(0),
});

export const taskSchema = z.object({
  id: z.string(),
  group: z.enum(TASK_GROUPS),
  title: z.string(),
  done: z.boolean(),
});

export const savedPlanSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  source: z.enum(["ai", "demo"]),
  details: eventSchema,
  budget: z.array(budgetLineSchema),
  content: planContentSchema,
  tasks: z.array(taskSchema),
});

export type BudgetLine = z.infer<typeof budgetLineSchema>;
export type Task = z.infer<typeof taskSchema>;
export type SavedPlan = z.infer<typeof savedPlanSchema>;
