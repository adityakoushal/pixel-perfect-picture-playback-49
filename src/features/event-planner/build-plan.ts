import { buildBudget } from "@/features/budget/allocate";
import { tasksFromContent } from "@/features/checklist/tasks";
import type { EventDetails } from "@/schemas/event";
import type { PlanContent, SavedPlan } from "@/schemas/plan";

/** Assembles a full plan from details + content. Budget is always computed in code. */
export function assemblePlan(
  id: string,
  details: EventDetails,
  content: PlanContent,
  source: SavedPlan["source"],
  existing?: SavedPlan | null,
): SavedPlan {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    source,
    details,
    budget: buildBudget(details),
    content,
    tasks: tasksFromContent(content),
  };
}
