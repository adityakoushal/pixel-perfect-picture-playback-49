import { createServerFn } from "@tanstack/react-start";

import { eventSchema } from "@/schemas/event";
import type { PlanContent } from "@/schemas/plan";
import { mapGatewayStatus, statusFromError, type PlanError } from "./ai-errors";

export type GeneratePlanResult = { ok: true; content: PlanContent } | { ok: false; error: PlanError };

export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(process.env['LOVABLE_API_KEY']),
}));

export const generatePlanWithAi = createServerFn({ method: "POST" })
  .validator((input: unknown) => eventSchema.parse(input))
  .handler(async ({ data }): Promise<GeneratePlanResult> => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) {
      return {
        ok: false,
        error: { code: "not_configured", message: "AI isn't configured. Demo mode is available.", retryable: false },
      };
    }
    try {
      const { generateAiContent } = await import("./ai.server");
      const content = await generateAiContent(data, apiKey);
      if (!content) {
        return {
          ok: false,
          error: { code: "invalid_output", message: "The AI returned an incomplete plan. Please try again.", retryable: true },
        };
      }
      return { ok: true, content };
    } catch (err) {
      console.error("AI plan generation failed", err);
      return { ok: false, error: mapGatewayStatus(statusFromError(err)) };
    }
  });
