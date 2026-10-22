import type { EventDetails } from "@/schemas/event";
import type { PlanContent } from "@/schemas/plan";

const PALETTES: Record<EventDetails["style"], { name: string; hex: string }[]> = {
  Elegant: [{ name: "Ivory", hex: "#F7F3EA" }, { name: "Champagne", hex: "#E6CFA0" }, { name: "Dusty Mauve", hex: "#A37C8C" }, { name: "Midnight", hex: "#1E2240" }],
  Minimal: [{ name: "Chalk", hex: "#F4F4F2" }, { name: "Stone", hex: "#BDB8AE" }, { name: "Sage", hex: "#9CAF94" }, { name: "Charcoal", hex: "#2E2E30" }],
  Traditional: [{ name: "Marigold", hex: "#F2A93B" }, { name: "Vermilion", hex: "#C8382D" }, { name: "Emerald", hex: "#1F6B4A" }, { name: "Antique Gold", hex: "#C9A24A" }],
  Luxury: [{ name: "Onyx", hex: "#111018" }, { name: "Royal Plum", hex: "#4B1F5C" }, { name: "Gold Leaf", hex: "#D4AF37" }, { name: "Pearl", hex: "#EFE9E1" }],
  Modern: [{ name: "Porcelain", hex: "#FAFAFA" }, { name: "Electric Violet", hex: "#7B5CFF" }, { name: "Graphite", hex: "#3A3A46" }, { name: "Coral", hex: "#FF7A66" }],
  Rustic: [{ name: "Linen", hex: "#EFE6D8" }, { name: "Terracotta", hex: "#C06A45" }, { name: "Olive", hex: "#6D7448" }, { name: "Walnut", hex: "#5A3E2B" }],
  Fun: [{ name: "Sunshine", hex: "#FFD23F" }, { name: "Bubblegum", hex: "#FF6FB5" }, { name: "Aqua", hex: "#3BCEAC" }, { name: "Grape", hex: "#6A4C93" }],
};

const DECOR: Record<EventDetails["style"], string> = {
  Elegant: "Soft candlelight, low floral centrepieces, satin linens and calligraphy signage.",
  Minimal: "Clean lines, single-stem florals, neutral linens and plenty of negative space.",
  Traditional: "Marigold garlands, brass lamps, handwoven textiles and cultural motifs.",
  Luxury: "Statement floral installations, mirrored accents, gold cutlery and layered lighting.",
  Modern: "Geometric arches, acrylic signage, neon accent words and sculptural florals.",
  Rustic: "Wooden crates, dried flowers, jute runners and warm Edison bulbs.",
  Fun: "Balloon garlands, confetti tables, photo props and bold colour blocking.",
};

const VENUE_IDEAS: Record<EventDetails["venue"], string> = {
  Indoor: "A hall or loft with good acoustics and flexible lighting control.",
  Outdoor: "A garden, terrace or lawn with a covered fallback area.",
  Home: "Your living and garden spaces, arranged into welcome, dining and lounge zones.",
  Hotel: "A hotel ballroom or banquet suite with in-house catering and guest rooms.",
  Undecided: "Shortlist one indoor and one outdoor option and compare by guest comfort and cost.",
};

function timelineFor(d: EventDetails): PlanContent["timeline"] {
  const common = {
    start: { time: "Setup (−3h)", activity: "Venue setup & vendor arrival", notes: "Decor, sound check, catering setup." },
    welcome: { time: "0:00", activity: "Guest arrival & welcome drinks", notes: `Plan seating or standing space for ${d.guests} guests.` },
    end: { time: "End", activity: "Farewell & teardown", notes: "Return-gifts, vendor payouts, venue walkthrough." },
  };
  const byType: Record<EventDetails["type"], PlanContent["timeline"]> = {
    Wedding: [
      { time: "0:30", activity: "Ceremony", notes: "Officiant, vows and rituals." },
      { time: "1:30", activity: "Couple portraits & cocktail hour", notes: "Photographer leads family photos." },
      { time: "2:30", activity: "Dinner & toasts", notes: "Keep speeches to 3–5 minutes each." },
      { time: "3:30", activity: "First dance & party", notes: "DJ or band takes over." },
    ],
    Birthday: [
      { time: "0:30", activity: "Games & activities", notes: "Icebreakers to mix guest groups." },
      { time: "1:30", activity: "Food is served", notes: `${d.food} menu.` },
      { time: "2:15", activity: "Cake cutting & wishes", notes: "Cue music and photographer." },
      { time: "2:45", activity: "Music & dancing", notes: "Open floor." },
    ],
    Anniversary: [
      { time: "0:30", activity: "Memory slideshow", notes: "Photos across the years." },
      { time: "1:00", activity: "Toasts & renewal of vows", notes: "Optional, short and heartfelt." },
      { time: "1:30", activity: "Dinner", notes: `${d.food} menu.` },
      { time: "2:30", activity: "Music & dancing", notes: "Play the couple's favourite songs." },
    ],
    "Corporate Event": [
      { time: "0:30", activity: "Opening keynote", notes: "AV test beforehand." },
      { time: "1:15", activity: "Sessions / workshops", notes: "Keep breakouts to 45 minutes." },
      { time: "2:30", activity: "Lunch & networking", notes: "Name badges help." },
      { time: "3:30", activity: "Awards & closing remarks", notes: "Share feedback form." },
    ],
    Festival: [
      { time: "0:30", activity: "Opening ceremony", notes: "Lamp lighting or ribbon cutting." },
      { time: "1:00", activity: "Performances & stalls open", notes: "Stagger acts every 30 minutes." },
      { time: "2:30", activity: "Feast", notes: `${d.food} spread.` },
      { time: "3:30", activity: "Headline act / fireworks", notes: "Check local permits." },
    ],
    "Community Event": [
      { time: "0:30", activity: "Welcome address", notes: "Thank organisers and sponsors." },
      { time: "1:00", activity: "Activities & stalls", notes: "Clear signage for zones." },
      { time: "2:00", activity: "Shared meal", notes: `${d.food} menu.` },
      { time: "3:00", activity: "Closing & group photo", notes: "Collect volunteer feedback." },
    ],
    Other: [
      { time: "0:30", activity: "Main programme", notes: "The heart of your event." },
      { time: "1:30", activity: "Food & refreshments", notes: `${d.food} menu.` },
      { time: "2:30", activity: "Entertainment", notes: "Music or activities." },
    ],
  };
  return [common.start, common.welcome, ...byType[d.type], common.end];
}

const TASKS: PlanContent["tasks"] = [
  { group: "Planning", title: "Confirm date, guest count and total budget" },
  { group: "Planning", title: "Create a shared planning document and owner for each area" },
  { group: "Planning", title: "Draft the guest list" },
  { group: "Venue and vendors", title: "Shortlist and visit 2–3 venues" },
  { group: "Venue and vendors", title: "Request written quotes from caterers, photographers and decorators" },
  { group: "Venue and vendors", title: "Sign contracts and pay deposits" },
  { group: "Food and decoration", title: "Finalise menu and arrange a tasting" },
  { group: "Food and decoration", title: "Approve decor mood board and colour palette" },
  { group: "Food and decoration", title: "Confirm dietary requirements with caterer" },
  { group: "Invitations", title: "Design and send invitations" },
  { group: "Invitations", title: "Track RSVPs and send reminders" },
  { group: "Event day", title: "Share run-of-show with all vendors" },
  { group: "Event day", title: "Prepare emergency kit (first aid, chargers, tape, safety pins)" },
  { group: "Event day", title: "Assign a point person for vendor questions" },
  { group: "Post-event", title: "Settle final vendor payments" },
  { group: "Post-event", title: "Send thank-you notes" },
  { group: "Post-event", title: "Collect and share photos" },
];

/** Deterministic template-based plan, used when AI is unavailable. */
export function generateDemoContent(d: EventDetails): PlanContent {
  const t = d.type.toLowerCase();
  return {
    overview: {
      concept: `A ${d.style.toLowerCase()} ${t} in ${d.location} for ${d.guests} guests, designed around warmth, flow and memorable moments.`,
      theme: `${d.style} ${d.type === "Other" ? "Celebration" : d.type}`,
      decorationStyle: DECOR[d.style],
      venueIdeas: VENUE_IDEAS[d.venue],
      ambience: d.style === "Fun" ? "Upbeat playlist, bright lighting and interactive corners." : "Warm layered lighting, a curated playlist and a calm arrival experience.",
      palette: PALETTES[d.style],
    },
    timeline: timelineFor(d),
    tasks: TASKS,
    vendors: [
      { category: "Venue", criteria: ["Capacity for your guest count", "Accessibility", "Backup space for weather"], questions: ["What's included in the hire fee?", "What are the cancellation terms?", "Are there noise or time restrictions?"] },
      { category: "Catering", criteria: [`Experience with ${d.food.toLowerCase()} menus`, "Tasting available", "Staffing ratio"], questions: ["Is service staff included?", "How do you handle allergies?", "What's the per-plate price breakdown?"] },
      { category: "Photography", criteria: ["Portfolio matches your style", "Delivery timeline", "Backup equipment"], questions: ["How many edited photos are included?", "Do you bring a second shooter?", "When will we receive the gallery?"] },
      { category: "Decoration", criteria: ["Matches the palette", "Setup and teardown included", "Reusable items"], questions: ["Can we see a mock-up?", "What's rented vs. purchased?", "How long does setup take?"] },
      { category: "Entertainment", criteria: ["Reviews from similar events", "Own sound equipment", "Flexible set list"], questions: ["How long are your sets?", "What do you need from the venue?", "Do you take requests?"] },
    ],
    comparisonChecklist: ["Total quoted price (with taxes)", "Deposit and payment schedule", "Cancellation policy", "What's included / excluded", "Availability on your date confirmed in writing", "References or reviews you verified yourself"],
    ideas: {
      themes: [`${d.style} evening`, "Story of you — personal milestones", "Garden of lights"],
      decor: [DECOR[d.style].split(",")[0] ?? "", "A signature welcome sign", "Personalised table cards"],
      activities: ["Photo booth with props", "Guest message wall", "Short interactive game or quiz"],
      food: d.food === "Not Applicable" ? ["Light refreshments station", "Signature mocktail"] : [`${d.food} live counter`, "Signature mocktail", "Dessert table"],
      entertainment: ["Curated playlist or DJ", "Live acoustic set", "Local performers"],
      savings: ["Choose an off-peak day or time", "Use seasonal, local flowers", "Send digital invitations", "Combine decor for ceremony and reception", "Keep 10% contingency untouched until the last week"],
    },
    risks: [
      { risk: "Bad weather", backup: d.venue === "Outdoor" ? "Book a marquee or indoor fallback; confirm 72h before." : "Arrange covered drop-off and umbrellas at the entrance." },
      { risk: "Vendor delay or no-show", backup: "Get written arrival times, keep a backup contact per category." },
      { risk: "Budget overrun", backup: "Track spending weekly; draw from contingency before cutting key items." },
      { risk: "Last-minute cancellations", backup: "Confirm final numbers with the caterer 5–7 days before; keep a small waitlist." },
    ],
  };
}
