import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowLeft, ArrowRight, Bot, Check, FlaskConical, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceChips } from "@/features/event-planner/ChoiceChips";
import { assemblePlan } from "@/features/event-planner/build-plan";
import { generateDemoContent } from "@/features/event-planner/demo-engine";
import { cn } from "@/lib/utils";
import {
  CURRENCIES, EVENT_STYLES, EVENT_TYPES, FOOD_PREFS, FORM_STEPS, VENUE_PREFS,
  eventSchema, type EventDetails, type EventFormInput,
} from "@/schemas/event";
import type { PlanError } from "@/services/ai-errors";
import { generatePlanWithAi, getAiStatus } from "@/services/plan.functions";
import { getPlan, newPlanId, savePlan } from "@/services/plan-storage";

export const Route = createFileRoute("/plan")({
  validateSearch: z.object({ edit: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Plan Your Event — CelebraAI" },
      { name: "description", content: "Tell CelebraAI about your event and get a personalised plan with budget, timeline and checklist." },
      { property: "og:title", content: "Plan Your Event — CelebraAI" },
      { property: "og:description", content: "A guided form that turns your event details into a complete plan." },
    ],
  }),
  component: PlanPage,
});

const DEFAULTS: EventFormInput = {
  name: "", type: "Birthday", date: "", location: "", guests: 50, budget: 100000,
  currency: "INR", style: "Elegant", venue: "Undecided", food: "Mixed", requirements: "", notes: "",
};

function FieldError({ id, msg }: { id: string; msg?: string | undefined }) {
  return msg ? <p id={id} role="alert" className="mt-1.5 text-sm text-destructive">{msg}</p> : null;
}

function PlanPage() {
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const callAi = useServerFn(generatePlanWithAi);
  const aiStatus = useServerFn(getAiStatus);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"ai" | "demo">("ai");
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PlanError | null>(null);

  const form = useForm<EventFormInput, unknown, EventDetails>({
    resolver: zodResolver(eventSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, trigger, reset, formState: { errors } } = form;

  useEffect(() => {
    aiStatus().then((s) => {
      setAiAvailable(s.configured);
      if (!s.configured) setMode("demo");
    }).catch(() => setAiAvailable(false));
  }, [aiStatus]);

  useEffect(() => {
    if (!edit) return;
    const existing = getPlan(edit);
    if (existing) reset(existing.details);
  }, [edit, reset]);

  async function next() {
    const ok = await trigger(FORM_STEPS[step]!.fields as unknown as (keyof EventFormInput)[]);
    console.log("TRIGGER", ok, JSON.stringify(form.formState.errors), JSON.stringify(form.getValues()));
    if (ok) setStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
  }

  async function generate(details: EventDetails, useMode = mode) {
    setBusy(true);
    setError(null);
    const existing = edit ? getPlan(edit) : null;
    const id = existing?.id ?? newPlanId();
    try {
      let plan;
      if (useMode === "ai") {
        const res = await callAi({ data: details });
        if (!res.ok) { setError(res.error); return; }
        plan = assemblePlan(id, details, res.content, "ai", existing);
      } else {
        plan = assemblePlan(id, details, generateDemoContent(details), "demo", existing);
      }
      savePlan(plan);
      navigate({ to: "/dashboard/$planId", params: { planId: id } });
    } catch {
      setError({ code: "unavailable", message: "Something went wrong reaching the planner. Please try again.", retryable: true });
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = handleSubmit((d) => generate(d));
  const progress = ((step + 1) / FORM_STEPS.length) * 100;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{edit ? "Edit & regenerate" : "New plan"}</p>
        <h1 className="mt-3 text-4xl font-semibold">Tell us about your celebration</h1>
      </div>

      <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Form progress">
        {FORM_STEPS.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined} className="text-center">
            <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-gradient-primary" : "bg-muted")} />
            <span className={cn("mt-2 hidden text-xs sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s.title}</span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">Step {step + 1} of {FORM_STEPS.length}: {FORM_STEPS[step]!.title}, {Math.round(progress)}% complete</p>

      <form onSubmit={onSubmit} noValidate className="glass mt-8 rounded-3xl p-6 sm:p-10">
        <h2 className="mb-6 text-2xl font-semibold">{FORM_STEPS[step]!.title}</h2>

        {step === 0 && (
          <div className="grid gap-6">
            <div>
              <Label htmlFor="name">Event name</Label>
              <Input id="name" className="mt-2" placeholder="e.g. Aanya's 30th Birthday" aria-invalid={!!errors.name} aria-describedby="name-error" {...register("name")} />
              <FieldError id="name-error" msg={errors.name?.message} />
            </div>
            <Controller control={control} name="type" render={({ field }) => (
              <ChoiceChips label="Event type" name="type" options={EVENT_TYPES} value={field.value} onChange={field.onChange} error={errors.type?.message} />
            )} />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Event date</Label>
                <Input id="date" type="date" className="mt-2" aria-invalid={!!errors.date} aria-describedby="date-error" {...register("date")} />
                <FieldError id="date-error" msg={errors.date?.message} />
              </div>
              <div>
                <Label htmlFor="location">City or location</Label>
                <Input id="location" className="mt-2" placeholder="e.g. Jaipur" aria-invalid={!!errors.location} aria-describedby="location-error" {...register("location")} />
                <FieldError id="location-error" msg={errors.location?.message} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="guests">Number of guests</Label>
              <Input id="guests" type="number" min={1} step={1} inputMode="numeric" className="mt-2" aria-invalid={!!errors.guests} aria-describedby="guests-hint guests-error" {...register("guests")} />
              <p id="guests-hint" className="mt-1.5 text-xs text-muted-foreground">Include hosts and family. 1 – 10,000.</p>
              <FieldError id="guests-error" msg={errors.guests?.message} />
            </div>
            <div>
              <Label htmlFor="budget">Total budget</Label>
              <Input id="budget" type="number" min={1} inputMode="decimal" className="mt-2" aria-invalid={!!errors.budget} aria-describedby="budget-hint budget-error" {...register("budget")} />
              <p id="budget-hint" className="mt-1.5 text-xs text-muted-foreground">Everything included — we keep ~10% as contingency.</p>
              <FieldError id="budget-error" msg={errors.budget?.message} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" className="mt-2 h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" {...register("currency")}>
                {CURRENCIES.map((c) => <option key={c} value={c} className="bg-popover">{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-7">
            <Controller control={control} name="style" render={({ field }) => (
              <ChoiceChips label="Preferred style" name="style" options={EVENT_STYLES} value={field.value} onChange={field.onChange} error={errors.style?.message} />
            )} />
            <Controller control={control} name="venue" render={({ field }) => (
              <ChoiceChips label="Venue preference" name="venue" options={VENUE_PREFS} value={field.value} onChange={field.onChange} error={errors.venue?.message} />
            )} />
            <Controller control={control} name="food" render={({ field }) => (
              <ChoiceChips label="Food preference" name="food" options={FOOD_PREFS} value={field.value} onChange={field.onChange} error={errors.food?.message} />
            )} />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6">
            <div>
              <Label htmlFor="requirements">Special requirements <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="requirements" rows={3} className="mt-2" placeholder="Wheelchair access, kids' corner, Jain food…" aria-describedby="requirements-error" {...register("requirements")} />
              <FieldError id="requirements-error" msg={errors.requirements?.message} />
            </div>
            <div>
              <Label htmlFor="notes">Additional notes <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="notes" rows={3} className="mt-2" placeholder="Anything else we should know?" aria-describedby="notes-error" {...register("notes")} />
              <FieldError id="notes-error" msg={errors.notes?.message} />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Generation mode</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { v: "ai", icon: Bot, t: "AI planner", d: aiAvailable === false ? "Not configured on this site" : "Personalised plan from an AI model" },
                  { v: "demo", icon: FlaskConical, t: "Demo mode", d: "Templates & budget rules — no AI called" },
                ] as const).map((o) => (
                  <label key={o.v} className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", mode === o.v ? "border-primary bg-accent" : "border-input", o.v === "ai" && aiAvailable === false && "cursor-not-allowed opacity-50")}>
                    <input type="radio" name="mode" className="sr-only" checked={mode === o.v} disabled={o.v === "ai" && aiAvailable === false} onChange={() => setMode(o.v)} />
                    <o.icon className="mt-0.5 size-5 text-primary" aria-hidden />
                    <span><span className="block font-semibold">{o.t}</span><span className="text-sm text-muted-foreground">{o.d}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 flex flex-col gap-3 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 sm:flex-row sm:items-center">
            <AlertTriangle className="size-5 shrink-0 text-destructive" aria-hidden />
            <p className="flex-1 text-sm">{error.message}</p>
            <div className="flex gap-2">
              {error.retryable && <Button type="button" size="sm" variant="outline" onClick={() => handleSubmit((d) => generate(d, "ai"))()}><RotateCcw /> Retry</Button>}
              <Button type="button" size="sm" variant="secondary" onClick={() => { setMode("demo"); handleSubmit((d) => generate(d, "demo"))(); }}><FlaskConical /> Use demo mode</Button>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || busy}>
            <ArrowLeft /> Back
          </Button>
          {step < FORM_STEPS.length - 1 ? (
            <Button type="button" variant="hero" onClick={next}>Continue <ArrowRight /></Button>
          ) : (
            <Button type="submit" variant="hero" disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" /> {mode === "ai" ? "Planning with AI…" : "Building plan…"}</> : <><Sparkles /> Generate My Plan</>}
            </Button>
          )}
        </div>
      </form>

      {busy && mode === "ai" && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <Check className="size-4 text-success" aria-hidden /> Crafting your concept, timeline and checklist — this can take up to a minute.
        </p>
      )}
    </section>
  );
}
