import type { EventDetails } from "@/schemas/event";
import type { BudgetLine } from "@/schemas/plan";

export const BUDGET_CATEGORIES = [
  { key: "venue", label: "Venue" },
  { key: "catering", label: "Food & catering" },
  { key: "decoration", label: "Decoration" },
  { key: "photo", label: "Photography & videography" },
  { key: "entertainment", label: "Entertainment" },
  { key: "invitations", label: "Invitations" },
  { key: "transport", label: "Transportation" },
  { key: "contingency", label: "Miscellaneous & contingency" },
] as const;

type Key = (typeof BUDGET_CATEGORIES)[number]["key"];
type Weights = Record<Key, number>;

const BASE: Record<EventDetails["type"], Weights> = {
  Wedding: { venue: 25, catering: 30, decoration: 12, photo: 10, entertainment: 7, invitations: 3, transport: 3, contingency: 10 },
  Birthday: { venue: 20, catering: 35, decoration: 15, photo: 7, entertainment: 10, invitations: 2, transport: 1, contingency: 10 },
  Anniversary: { venue: 25, catering: 35, decoration: 12, photo: 8, entertainment: 7, invitations: 2, transport: 1, contingency: 10 },
  "Corporate Event": { venue: 30, catering: 30, decoration: 8, photo: 6, entertainment: 8, invitations: 2, transport: 6, contingency: 10 },
  Festival: { venue: 22, catering: 25, decoration: 15, photo: 5, entertainment: 18, invitations: 2, transport: 3, contingency: 10 },
  "Community Event": { venue: 20, catering: 30, decoration: 12, photo: 5, entertainment: 15, invitations: 3, transport: 5, contingency: 10 },
  Other: { venue: 25, catering: 30, decoration: 12, photo: 7, entertainment: 10, invitations: 3, transport: 3, contingency: 10 },
};

/** Adjust weights for venue choice: home venues cost less, freeing budget for food/decor. */
export function categoryWeights(type: EventDetails["type"], venue: EventDetails["venue"]): Weights {
  const w = { ...BASE[type] };
  if (venue === "Home") {
    const freed = w.venue - 5;
    w.venue = 5;
    w.catering += Math.round(freed * 0.5);
    w.decoration += freed - Math.round(freed * 0.5);
  } else if (venue === "Hotel") {
    w.venue += 5;
    w.decoration -= 3;
    w.catering -= 2;
  }
  return w;
}

/**
 * Splits `total` across categories by weight. Amounts are whole currency units
 * and always sum exactly to the rounded total (largest-remainder method).
 */
export function allocateBudget(total: number, weights: Weights): BudgetLine[] {
  const whole = Math.max(0, Math.round(total));
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const raw = BUDGET_CATEGORIES.map((c) => {
    const exact = (whole * weights[c.key]) / sum;
    return { ...c, floor: Math.floor(exact), rem: exact - Math.floor(exact) };
  });
  let leftover = whole - raw.reduce((a, r) => a + r.floor, 0);
  const order = [...raw].sort((a, b) => b.rem - a.rem);
  for (const r of order) {
    if (leftover <= 0) break;
    r.floor += 1;
    leftover -= 1;
  }
  return raw.map((r) => ({
    key: r.key,
    label: r.label,
    amount: r.floor,
    percent: whole === 0 ? 0 : Math.round((r.floor / whole) * 1000) / 10,
    spent: 0,
  }));
}

export function buildBudget(details: Pick<EventDetails, "budget" | "type" | "venue">) {
  return allocateBudget(details.budget, categoryWeights(details.type, details.venue));
}

export function budgetTotals(lines: BudgetLine[]) {
  const planned = lines.reduce((a, l) => a + l.amount, 0);
  const spent = lines.reduce((a, l) => a + (l.spent || 0), 0);
  return { planned, spent, remaining: planned - spent };
}

export function perGuest(total: number, guests: number) {
  return guests > 0 ? Math.round(total / guests) : 0;
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}
