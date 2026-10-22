import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-celebration.jpg";
import { Button } from "@/components/ui/button";
import { FeatureGrid, SectionHeading, StepsList } from "@/components/marketing/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CelebraAI — Every Celebration Deserves a Perfect Plan" },
      { name: "description", content: "Turn your ideas, budget and dreams into an organised event plan with your personal AI planning assistant." },
      { property: "og:title", content: "CelebraAI — Every Celebration Deserves a Perfect Plan" },
      { property: "og:description", content: "AI event plans with budgets, timelines, checklists and vendor guidance." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 overflow-x-clip px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div className="animate-rise">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="size-3.5 text-gold" aria-hidden /> AI-powered celebration planning
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-6xl">
            Every Celebration Deserves a <span className="text-gradient-gold italic">Perfect Plan.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Turn your ideas, budget, and dreams into a beautifully organised event with your personal AI planning assistant.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="hero" size="lg">
              <Link to="/plan">Create My Event Plan <ArrowRight /></Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link to="/features">Explore Features</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" aria-hidden /> Budgets that add up</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" aria-hidden /> No sign-up, saved in your browser</li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-primary opacity-30 blur-3xl" aria-hidden />
          <img
            src={heroImg}
            alt="Candlelit celebration table with violet florals and champagne glasses"
            width={1600}
            height={1008}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-elegant"
          />
          <div className="glass animate-float absolute -bottom-6 left-3 rounded-2xl p-3 sm:-left-8 sm:p-4">
            <p className="text-xs text-muted-foreground">Budget allocated</p>
            <p className="font-display text-2xl">100% <span className="text-sm text-success">balanced</span></p>
          </div>
          <div className="glass animate-float absolute right-3 top-4 rounded-2xl p-3 sm:-right-3 sm:top-6 sm:p-4 [animation-delay:1.5s]">
            <p className="text-xs text-muted-foreground">Checklist</p>
            <p className="font-semibold">18 of 24 done</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Features" title="Everything your event needs, in one plan" />
        <FeatureGrid />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From idea to itinerary in four steps" />
        <StepsList />
        <div className="mt-12 text-center">
          <Button asChild variant="gold" size="lg">
            <Link to="/plan">Start planning <ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
