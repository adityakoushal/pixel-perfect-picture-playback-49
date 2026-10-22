import { z } from "zod";

export const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Corporate Event",
  "Festival",
  "Community Event",
  "Other",
] as const;
export const EVENT_STYLES = [
  "Elegant",
  "Minimal",
  "Traditional",
  "Luxury",
  "Modern",
  "Rustic",
  "Fun",
] as const;
export const VENUE_PREFS = ["Indoor", "Outdoor", "Home", "Hotel", "Undecided"] as const;
export const FOOD_PREFS = [
  "Vegetarian",
  "Non-vegetarian",
  "Vegan",
  "Mixed",
  "Not Applicable",
] as const;
export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD"] as const;

export const MAX_GUESTS = 10000;
export const MAX_BUDGET = 1_000_000_000;

function startOfToday(now: Date) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Builds the event schema. `now` is injectable so date rules are testable. */
export function makeEventSchema(now: () => Date = () => new Date()) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Give your event a name (at least 2 characters).")
      .max(80, "Keep the name under 80 characters."),
    type: z.enum(EVENT_TYPES, { errorMap: () => ({ message: "Choose an event type." }) }),
    date: z
      .string()
      .min(1, "Pick the event date.")
      .refine((v) => !Number.isNaN(new Date(v + "T00:00:00").getTime()), "Enter a valid date.")
      .refine(
        (v) => new Date(v + "T00:00:00") >= startOfToday(now()),
        "The event date can't be in the past.",
      )
      .refine((v) => {
        const limit = startOfToday(now());
        limit.setFullYear(limit.getFullYear() + 5);
        return new Date(v + "T00:00:00") <= limit;
      }, "Choose a date within the next 5 years."),
    location: z
      .string()
      .trim()
      .min(2, "Tell us the city or location.")
      .max(100, "Keep the location under 100 characters."),
    guests: z.coerce
      .number({ invalid_type_error: "Enter the number of guests." })
      .int("Guest count must be a whole number.")
      .min(1, "You need at least 1 guest.")
      .max(MAX_GUESTS, `We support up to ${MAX_GUESTS.toLocaleString()} guests.`),
    budget: z.coerce
      .number({ invalid_type_error: "Enter your total budget." })
      .positive("Budget must be greater than zero.")
      .max(MAX_BUDGET, "That budget is beyond what we can plan for."),
    currency: z.enum(CURRENCIES),
    style: z.enum(EVENT_STYLES, { errorMap: () => ({ message: "Choose a style." }) }),
    venue: z.enum(VENUE_PREFS, { errorMap: () => ({ message: "Choose a venue preference." }) }),
    food: z.enum(FOOD_PREFS, { errorMap: () => ({ message: "Choose a food preference." }) }),
    requirements: z.string().trim().max(500, "Keep this under 500 characters.").default(""),
    notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").default(""),
  });
}

export const eventSchema = makeEventSchema();
export type EventDetails = z.infer<typeof eventSchema>;
export type EventFormInput = z.input<typeof eventSchema>;

/** Fields validated on each step of the planning form. */
export const FORM_STEPS = [
  { title: "The occasion", fields: ["name", "type", "date", "location"] },
  { title: "Guests & budget", fields: ["guests", "budget", "currency"] },
  { title: "Style & preferences", fields: ["style", "venue", "food"] },
  { title: "Final touches", fields: ["requirements", "notes"] },
] as const satisfies ReadonlyArray<{ title: string; fields: ReadonlyArray<keyof EventDetails> }>;
