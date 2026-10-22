import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/marketing/Sections";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CelebraAI" },
      { name: "description", content: "Why CelebraAI exists, how your data is handled and the limits of AI estimates." },
      { property: "og:title", content: "About — CelebraAI" },
      { property: "og:description", content: "Why CelebraAI exists, how your data is handled and the limits of AI estimates." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="About" title="Planning should feel like part of the celebration" />
      <div className="glass mt-10 space-y-5 rounded-2xl p-8 text-muted-foreground">
        <p>CelebraAI helps you turn a date, a budget and a feeling into a practical plan: a concept, a balanced budget, a timeline, a checklist and guidance for choosing vendors.</p>
        <h3 className="text-lg font-semibold text-foreground">Your data</h3>
        <p>There's no account. Plans are stored only in this browser's local storage — clearing your browser data removes them. When you generate with AI, your event details are sent to an AI model only to create the plan.</p>
        <h3 className="text-lg font-semibold text-foreground">Honest estimates</h3>
        <p>Budget amounts are rule-based allocations of the total you enter — illustrative and adjustable, not market prices or quotations. We never invent real vendor names, reviews or availability.</p>
        <h3 className="text-lg font-semibold text-foreground">Demo mode</h3>
        <p>If AI is unavailable, a clearly labelled demo mode builds a plan from templates and budget rules. No AI model is called in demo mode.</p>
      </div>
    </section>
  );
}
