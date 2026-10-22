import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading, StepsList } from "@/components/marketing/Sections";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — CelebraAI" },
      { name: "description", content: "Four simple steps from event idea to a complete, trackable plan." },
      { property: "og:title", content: "How It Works — CelebraAI" },
      { property: "og:description", content: "Four simple steps from event idea to a complete, trackable plan." },
    ],
  }),
  component: HowPage,
});

function HowPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="How it works" title="Plan in minutes, refine for weeks" sub="Your budget split is calculated by fixed rules so it always adds up; the AI focuses on ideas, timelines and checklists." />
      <StepsList />
      <div className="mt-12 text-center">
        <Button asChild variant="hero" size="lg"><Link to="/plan">Create My Event Plan</Link></Button>
      </div>
    </section>
  );
}
