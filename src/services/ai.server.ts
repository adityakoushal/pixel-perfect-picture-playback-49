import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";

import type { EventDetails } from "@/schemas/event";
import { parsePlanContent, planContentSchema, type PlanContent } from "@/schemas/plan";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are CelebraAI, an expert event planner. Produce a practical, personalised plan.
Rules:
- Never invent real vendor names, reviews, contact details, availability or prices.
- Vendor entries are categories with selection criteria and questions to ask.
- Timeline: 6-12 chronological entries with relative or clock times suited to the event type.
- Tasks: 16-30 actionable tasks spread across all groups.
- Palette: 4-5 colours with valid #RRGGBB hex codes.
- Ideas: 3-5 items per list; savings: 4-6 practical ways to save money.
- Risks: 4-6 contingencies (weather, delays, budget overruns, cancellations where relevant).
- Respect the food preference and special requirements. Keep text concise.`;

function describe(d: EventDetails) {
  return [
    `Event name: ${d.name}`,
    `Type: ${d.type}`,
    `Date: ${d.date}`,
    `Location: ${d.location}`,
    `Guests: ${d.guests}`,
    `Total budget: ${d.budget} ${d.currency}`,
    `Style: ${d.style}`,
    `Venue preference: ${d.venue}`,
    `Food preference: ${d.food}`,
    `Special requirements: ${d.requirements || "none"}`,
    `Notes: ${d.notes || "none"}`,
  ].join("\n");
}

export async function generateAiContent(details: EventDetails, apiKey: string): Promise<PlanContent | null> {
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    prompt: `Plan this event:\n${describe(details)}`,
    output: Output.object({ schema: planContentSchema }),
    maxRetries: 1,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return parsePlanContent(output);
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      try {
        return err.text ? parsePlanContent(JSON.parse(err.text)) : null;
      } catch {
        return null;
      }
    }
    throw err;
  }
}
