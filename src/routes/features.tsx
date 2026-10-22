import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FeatureGrid, SectionHeading } from "@/components/marketing/Sections";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — CelebraAI" },
      { name: "description", content: "Smart budgets, personalised ideas, automated timelines and vendor checklists." },
      { property: "og:title", content: "Features — CelebraAI" },
      { property: "og:description", content: "Smart budgets, personalised ideas, automated timelines and vendor checklists." },
    ],
  }),
  component: FeaturesPage,
});

const EXTRA = [
  ["Risk & backup plans", "Contingencies for weather, delays, overruns and cancellations."],
  ["Spending tracker", "Log what you've actually spent per category and watch the remaining balance."],
  ["Edit & regenerate", "Change guests, budget or style and rebuild the plan instantly."],
  ["Print-ready", "Export a clean printable version for vendors and family."],
  ["Demo mode", "Works without AI using clearly labelled, rule-based templates."],
  ["Private by default", "No account. Plans live in your browser only."],
];

function FeaturesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="Features" title="Built for real celebrations" sub="Practical planning tools — not just pretty ideas." />
      <FeatureGrid />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXTRA.map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-border p-5">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button asChild variant="hero" size="lg"><Link to="/plan">Plan My Event</Link></Button>
      </div>
    </section>
  );
}
