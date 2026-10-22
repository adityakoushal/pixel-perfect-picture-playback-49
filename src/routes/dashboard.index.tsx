import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, FolderOpen, Info, MapPin, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/features/event-planner/ConfirmDelete";
import { formatMoney } from "@/features/budget/allocate";
import { taskProgress } from "@/features/checklist/tasks";
import type { SavedPlan } from "@/schemas/plan";
import { deletePlan, listPlans } from "@/services/plan-storage";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "My Plans — CelebraAI" },
      { name: "description", content: "Open, track and manage your saved celebration plans." },
      { property: "og:title", content: "My Plans — CelebraAI" },
      { property: "og:description", content: "Open, track and manage your saved celebration plans." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [plans, setPlans] = useState<SavedPlan[] | null>(null);
  useEffect(() => setPlans(listPlans()), []);

  function remove(id: string) {
    deletePlan(id);
    setPlans(listPlans());
    toast.success("Plan deleted");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">My plans</h1>
        </div>
        <Button asChild variant="hero"><Link to="/plan"><Plus /> New plan</Link></Button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="size-4" aria-hidden /> Plans are saved in this browser only. Clearing browser data or switching devices won't carry them over.
      </p>

      {plans === null ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass mt-10 rounded-3xl p-12 text-center">
          <FolderOpen className="mx-auto size-10 text-gold" aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold">No plans yet</h2>
          <p className="mt-2 text-muted-foreground">Create your first celebration plan in a couple of minutes.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/plan">Create My Event Plan</Link></Button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const prog = taskProgress(p.tasks);
            return (
              <li key={p.id} className="glass flex flex-col rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{p.details.type}</Badge>
                    <h2 className="mt-3 text-xl font-semibold">{p.details.name}</h2>
                  </div>
                  <Badge variant="outline">{p.source === "ai" ? "AI" : "Demo"}</Badge>
                </div>
                <dl className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="size-4" aria-hidden /><dt className="sr-only">Date</dt><dd>{new Date(p.details.date + "T00:00:00").toLocaleDateString(undefined, { dateStyle: "medium" })}</dd></div>
                  <div className="flex items-center gap-2"><MapPin className="size-4" aria-hidden /><dt className="sr-only">Location</dt><dd>{p.details.location}</dd></div>
                  <div className="flex items-center gap-2"><Users className="size-4" aria-hidden /><dt className="sr-only">Guests</dt><dd>{p.details.guests} guests · {formatMoney(p.details.budget, p.details.currency)}</dd></div>
                </dl>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Tasks</span><span>{prog.done}/{prog.total}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${prog.percent}%` }} /></div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button asChild className="flex-1"><Link to="/dashboard/$planId" params={{ planId: p.id }}>Open</Link></Button>
                  <ConfirmDelete name={p.details.name} onConfirm={() => remove(p.id)}>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${p.details.name}`}><Trash2 /></Button>
                  </ConfirmDelete>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
