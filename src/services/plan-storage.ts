import { savedPlanSchema, type SavedPlan } from "@/schemas/plan";

export const STORAGE_KEY = "celebraai.plans.v1";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Returns all valid saved plans, newest first. Corrupt entries are skipped. */
export function listPlans(): SavedPlan[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = JSON.parse(s.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((p) => savedPlanSchema.safeParse(p))
      .filter((r) => r.success)
      .map((r) => r.data as SavedPlan)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function getPlan(id: string): SavedPlan | null {
  return listPlans().find((p) => p.id === id) ?? null;
}

function write(plans: SavedPlan[]) {
  const s = storage();
  if (!s) throw new Error("Browser storage is unavailable.");
  s.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function savePlan(plan: SavedPlan): SavedPlan {
  const next = { ...plan, updatedAt: new Date().toISOString() };
  const others = listPlans().filter((p) => p.id !== plan.id);
  write([next, ...others]);
  return next;
}

export function deletePlan(id: string) {
  write(listPlans().filter((p) => p.id !== id));
}

export function newPlanId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
