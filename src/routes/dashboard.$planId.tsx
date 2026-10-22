import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle, CalendarDays, CheckSquare, Clock, Lightbulb, Loader2, MapPin, Pencil, PiggyBank,
  Printer, RefreshCw, ShieldAlert, Store, Trash2, Users, Wand2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BudgetSection } from "@/features/budget/BudgetSection";
import { budgetTotals, formatMoney, perGuest } from "@/features/budget/allocate";
import { taskProgress, toggleTask } from "@/features/checklist/tasks";
import { assemblePlan } from "@/features/event-planner/build-plan";
import { ConfirmDelete } from "@/features/event-planner/ConfirmDelete";
import { generateDemoContent } from "@/features/event-planner/demo-engine";
import { TASK_GROUPS, type SavedPlan } from "@/schemas/plan";
import { generatePlanWithAi } from "@/services/plan.functions";
import { deletePlan, getPlan, savePlan } from "@/services/plan-storage";

export const Route = createFileRoute("/dashboard/$planId")({
  head: () => ({
    meta: [
      { title: "Your Event Plan — CelebraAI" },
      { name: "description", content: "Your personalised event plan: budget, timeline, checklist, vendors and backup plans." },
      { property: "og:title", content: "Your Event Plan — CelebraAI" },
      { property: "og:description", content: "Budget, timeline, checklist, vendors and backup plans in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlanView,
});

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Wand2 },
  { id: "budget", label: "Budget", icon: PiggyBank },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "vendors", label: "Vendors", icon: Store },
  { id: "ideas", label: "Ideas", icon: Lightbulb },
  { id: "risks", label: "Backup plan", icon: ShieldAlert },
] as const;

function Panel({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof Wand2; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="glass min-w-0 scroll-mt-32 rounded-3xl p-5 sm:p-8">
      <h2 id={`${id}-h`} className="mb-5 flex items-center gap-3 text-xl font-semibold sm:text-2xl">
        <Icon className="size-5 text-gold" aria-hidden /> {title}
      </h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
}

function PlanView() {
  const { planId } = Route.useParams();
  const navigate = useNavigate();
  const callAi = useServerFn(generatePlanWithAi);
  const [plan, setPlan] = useState<SavedPlan | null | undefined>(undefined);
  const [regen, setRegen] = useState(false);

  useEffect(() => setPlan(getPlan(planId)), [planId]);

  function update(next: SavedPlan) {
    setPlan(savePlan(next));
  }

  async function regenerate() {
    if (!plan) return;
    setRegen(true);
    try {
      if (plan.source === "ai") {
        const res = await callAi({ data: plan.details });
        if (!res.ok) { toast.error(res.error.message); return; }
        update(assemblePlan(plan.id, plan.details, res.content, "ai", plan));
      } else {
        update(assemblePlan(plan.id, plan.details, generateDemoContent(plan.details), "demo", plan));
      }
      toast.success("Plan regenerated");
    } catch {
      toast.error("Couldn't regenerate right now. Please try again.");
    } finally {
      setRegen(false);
    }
  }

  if (plan === undefined) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" aria-label="Loading plan" /></div>;
  }
  if (plan === null) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Plan not found</h1>
        <p className="mt-3 text-muted-foreground">It may have been deleted, or saved in a different browser.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/dashboard">Back to my plans</Link></Button>
      </section>
    );
  }

  const d = plan.details;
  const c = plan.content;
  const prog = taskProgress(plan.tasks);
  const totals = budgetTotals(plan.budget);
  const days = Math.ceil((new Date(d.date + "T00:00:00").getTime() - Date.now()) / 86400000);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{d.type}</Badge>
            <Badge variant="outline">{d.style}</Badge>
            {plan.source === "ai" ? <Badge className="bg-gradient-primary">AI generated</Badge> : <Badge variant="outline" className="border-gold text-gold">Demo mode · templates, no AI</Badge>}
          </div>
          <h1 className="mt-3 break-words text-3xl font-semibold sm:text-5xl">{d.name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />{new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "full" })}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{d.location}</span>
            <span className="flex items-center gap-1.5"><Users className="size-4" aria-hidden />{d.guests} guests</span>
          </p>
        </div>
        <div className="no-print grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Button variant="outline" onClick={() => navigate({ to: "/plan", search: { edit: plan.id } })}><Pencil /> Edit details</Button>
          <Button variant="outline" onClick={regenerate} disabled={regen}>{regen ? <Loader2 className="animate-spin" /> : <RefreshCw />} Regenerate</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer /> Print</Button>
          <ConfirmDelete name={d.name} onConfirm={() => { deletePlan(plan.id); toast.success("Plan deleted"); navigate({ to: "/dashboard" }); }}>
            <Button variant="ghost" aria-label="Delete plan" className="sm:w-10 sm:px-0"><Trash2 /><span className="sm:hidden">Delete</span></Button>
          </ConfirmDelete>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          ["Days to go", days >= 0 ? String(days) : "Past"],
          ["Total budget", formatMoney(totals.planned, d.currency)],
          ["Remaining", formatMoney(totals.remaining, d.currency)],
          ["Per guest", formatMoney(perGuest(totals.planned, d.guests), d.currency)],
        ].map(([k, v]) => (
          <div key={k} className="glass min-w-0 rounded-2xl p-4 sm:p-5"><dt className="text-[11px] uppercase tracking-wider text-muted-foreground sm:text-xs">{k}</dt><dd className="mt-1 truncate font-display text-xl sm:text-2xl">{v}</dd></div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="Plan sections" className="no-print sticky top-16 z-30 -mx-4 min-w-0 bg-background/85 px-4 py-2 backdrop-blur-xl lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col">
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"><s.icon className="size-4" aria-hidden />{s.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          <Panel id="overview" title="Event overview" icon={Wand2}>
            <p className="font-display text-2xl text-gradient-gold">{c.overview.theme}</p>
            <p className="mt-3 text-muted-foreground">{c.overview.concept}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              {c.overview.palette.map((p) => (
                <div key={p.hex} className="text-center">
                  <span className="block size-14 rounded-2xl border border-border shadow-elegant" style={{ background: p.hex }} aria-hidden />
                  <span className="mt-1.5 block text-xs">{p.name}</span>
                  <span className="block text-[10px] uppercase text-muted-foreground">{p.hex}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[["Decoration", c.overview.decorationStyle], ["Venue ideas", c.overview.venueIdeas], ["Ambience", c.overview.ambience]].map(([k, v]) => (
                <div key={k}><h3 className="text-sm font-semibold">{k}</h3><p className="mt-1 text-sm text-muted-foreground">{v}</p></div>
              ))}
            </div>
          </Panel>

          <Panel id="budget" title="Budget breakdown" icon={PiggyBank}>
            <BudgetSection
              lines={plan.budget}
              currency={d.currency}
              onSpentChange={(key, spent) => update({ ...plan, budget: plan.budget.map((l) => (l.key === key ? { ...l, spent } : l)) })}
            />
          </Panel>

          <Panel id="timeline" title="Event timeline" icon={Clock}>
            <ol className="relative space-y-5 border-l border-border pl-6">
              {c.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-gradient-primary ring-4 ring-background" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">{t.time}</p>
                  <p className="font-semibold">{t.activity}</p>
                  {t.notes && <p className="text-sm text-muted-foreground">{t.notes}</p>}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel id="checklist" title="Task checklist" icon={CheckSquare}>
            <div className="mb-6">
              <div className="flex justify-between text-sm"><span>{prog.done} of {prog.total} tasks done</span><span className="font-semibold">{prog.percent}%</span></div>
              <div className="mt-2 h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={prog.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Task completion">
                <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${prog.percent}%` }} />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {TASK_GROUPS.map((g) => {
                const items = plan.tasks.filter((t) => t.group === g);
                if (!items.length) return null;
                return (
                  <div key={g}>
                    <h3 className="mb-2 text-sm font-semibold">{g}</h3>
                    <ul className="space-y-2">
                      {items.map((t) => (
                        <li key={t.id} className="flex items-start gap-3 py-1">
                          <Checkbox id={t.id} checked={t.done} onCheckedChange={() => update({ ...plan, tasks: toggleTask(plan.tasks, t.id) })} className="mt-0.5 size-5" />
                          <label htmlFor={t.id} className={t.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>{t.title}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel id="vendors" title="Vendor planning" icon={Store}>
            <p className="mb-5 text-sm text-muted-foreground">Categories and guidance only — no real vendor names, reviews or availability are suggested. Always verify vendors yourself.</p>
            <div className="grid gap-5 md:grid-cols-2">
              {c.vendors.map((v) => (
                <div key={v.category} className="rounded-2xl border border-border p-5">
                  <h3 className="font-semibold">{v.category}</h3>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gold">Look for</p>
                  <List items={v.criteria} />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gold">Ask</p>
                  <List items={v.questions} />
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-semibold">Quote comparison checklist</h3>
            <div className="mt-2"><List items={c.comparisonChecklist} /></div>
          </Panel>

          <Panel id="ideas" title="Personalised ideas" icon={Lightbulb}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {([["Themes", c.ideas.themes], ["Decoration", c.ideas.decor], ["Activities", c.ideas.activities], ["Food", c.ideas.food], ["Entertainment", c.ideas.entertainment], ["Ways to save", c.ideas.savings]] as const).map(([k, v]) => (
                <div key={k}><h3 className="mb-2 text-sm font-semibold">{k}</h3><List items={[...v]} /></div>
              ))}
            </div>
          </Panel>

          <Panel id="risks" title="Risk & backup plan" icon={ShieldAlert}>
            <ul className="grid gap-4 md:grid-cols-2">
              {c.risks.map((r) => (
                <li key={r.risk} className="flex gap-3 rounded-2xl border border-border p-4">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                  <div><p className="font-semibold">{r.risk}</p><p className="text-sm text-muted-foreground">{r.backup}</p></div>
                </li>
              ))}
            </ul>
          </Panel>

          <p className="text-xs text-muted-foreground">All estimates and suggestions are illustrative and not guaranteed quotations. This plan is stored only in this browser.</p>
        </div>
      </div>
    </div>
  );
}
