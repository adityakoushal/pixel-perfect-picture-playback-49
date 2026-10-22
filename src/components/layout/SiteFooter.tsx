import { Link } from "@tanstack/react-router";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Your intelligent celebration planner — budgets, timelines and checklists in minutes.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Explore</span>
          <Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link>
          <Link to="/plan" className="text-muted-foreground hover:text-foreground">Plan an event</Link>
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">My plans</Link>
        </nav>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Privacy</span>
          <p className="text-muted-foreground">
            Plans are saved only in this browser. Event details are sent to an AI model solely to generate your plan.
          </p>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">About CelebraAI</Link>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Disclaimer: all prices are illustrative estimates and vendor suggestions are general guidance — they are not guaranteed quotations. Always confirm prices and availability directly with vendors. © {new Date().getFullYear()} CelebraAI.
        </p>
      </div>
    </footer>
  );
}
