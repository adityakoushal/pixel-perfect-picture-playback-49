import { CalendarClock, ClipboardCheck, Lightbulb, PiggyBank } from "lucide-react";

export const FEATURES = [
  { icon: PiggyBank, title: "Smart Budget Planning", body: "An itemised split across eight categories that always adds up — with a chart and live remaining balance." },
  { icon: Lightbulb, title: "Personalised Event Ideas", body: "Themes, palettes, décor, food and activities shaped by your style, venue and guests." },
  { icon: CalendarClock, title: "Automated Timelines", body: "A chronological run-of-show adapted to your event type, from setup to farewell." },
  { icon: ClipboardCheck, title: "Vendor & Task Checklists", body: "Grouped, tickable tasks plus vendor criteria and the questions worth asking." },
];

export const STEPS = [
  { title: "Tell us about your event", body: "Name, type, date and city." },
  { title: "Set your budget and preferences", body: "Guests, budget, style, venue and food." },
  { title: "Generate your personalised plan", body: "AI builds the concept, timeline and checklists." },
  { title: "Organise, edit, and track", body: "Tick off tasks, log spending, print or regenerate." },
];

export function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function FeatureGrid() {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((f, i) => (
        <article key={f.title} className="glass animate-rise rounded-2xl p-6 transition-transform hover:-translate-y-1" style={{ animationDelay: `${i * 80}ms` }}>
          <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
            <f.icon className="size-5" aria-hidden />
          </span>
          <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
        </article>
      ))}
    </div>
  );
}

export function StepsList() {
  return (
    <ol className="mt-12 grid gap-5 md:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.title} className="glass relative rounded-2xl p-6">
          <span className="font-display text-4xl text-gradient-gold">0{i + 1}</span>
          <h3 className="mt-3 font-semibold">{s.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
