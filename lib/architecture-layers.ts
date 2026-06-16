/* Canonical architecture (2026) — single source of truth for the homepage
   cinematic stack (ArchitectureFilm) and the /architecture page.

   The EIGHT FOUNDATIONAL LAYERS (Intelligence → … → Financial). Each carries an
   honest maturity badge — never rounded up. DOP remains the Digital Organism
   Protocol (the improvement metabolism); the Financial layer is Commerce.
   Names/structure per the founder's 2026 canonical-architecture brief. */

export type Tone = "open" | "enforced" | "prod" | "measured" | "roadmap";

export const TONE: Record<Tone, { hex: string; label: string }> = {
  open: { hex: "#0a84ff", label: "Open" },
  prod: { hex: "#3ddc97", label: "Production" },
  enforced: { hex: "#8b5cf6", label: "Enforced" },
  measured: { hex: "#22d3ee", label: "Measured" },
  roadmap: { hex: "#f5a623", label: "Roadmap" },
};

export type Layer = {
  n: string;
  name: string;
  full: string;
  role: string;
  status: string;
  tone: Tone;
  blurb: string;
  cta: { label: string; href: string };
};

export const LAYERS: Layer[] = [
  {
    n: "01", name: "Intelligence", full: "Bring any model", role: "Reasoning", status: "OPEN", tone: "open",
    blurb: "Claude, GPT, Gemini, Qwen, DeepSeek, open-weights — frontier or local. Models are commodities; you bring them, swap them, and never get locked in.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "02", name: "Identity", full: "Ownership & authority", role: "Who owns & acts", status: "ENFORCED", tone: "enforced",
    blurb: "Who owns this intelligence, which node and which agent is acting, what authority and permissions exist. Identity is the first requirement for accountability.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "03", name: "ECP", full: "Efficient Context Protocol", role: "Continuity", status: "PRODUCTION", tone: "prod",
    blurb: "Context, state, knowledge, receipts, ledgers and manifests that persist — turning temporary AI outputs into durable, compounding organizational intelligence.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "04", name: "StratosAgent", full: "Open-source runtime", role: "Infrastructure", status: "PRODUCTION", tone: "prod",
    blurb: "Run autonomous intelligence locally, under your control — model routing, tool and workflow execution, identity, receipts and governance. Open source, free forever.",
    cta: { label: "Get StratosAgent", href: "/stratos" },
  },
  {
    n: "05", name: "Governance Harness", full: "Trust infrastructure", role: "Governance", status: "ENFORCED", tone: "enforced",
    blurb: "Capability, authority and human-approval gates, escalation and evaluation policies, receipts, audit trails and denial records — turning autonomous into trustworthy autonomous.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "06", name: "Atmosphere", full: "Ownership infrastructure", role: "Ownership", status: "PRODUCTION", tone: "prod",
    blurb: "Own your compute, context, memory, identity and infrastructure — intelligence that lives outside cloud dependency. Sovereignty instead of data sharecropping.",
    cta: { label: "Explore Atmosphere", href: "/atmosphere" },
  },
  {
    n: "07", name: "ARI", full: "Autonomous Readiness Index", role: "Economic & readiness", status: "MEASURED", tone: "measured",
    blurb: "Measure whether intelligence is ready for autonomy — across governance, ownership, continuity, security, economics, commerce, identity and infrastructure — and what it costs.",
    cta: { label: "Run your readiness index", href: "/score" },
  },
  {
    n: "08", name: "Commerce", full: "Governed spend", role: "Financial", status: "ROADMAP", tone: "roadmap",
    blurb: "The money-governance layer for autonomous work: should this transaction occur, who authorized it, what budget and wallet govern it, what limits and evidence apply — governed spend before autonomy ever touches money.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
];

/* The product ecosystem — what's actually shippable, mapped to the layers above.
   DOP = the Digital Organism Protocol (improvement metabolism). */
export type Product = {
  name: string;
  full: string;
  category: string;
  status: string;
  tone: Tone;
  blurb: string;
  href: string;
};

export const PRODUCTS: Product[] = [
  {
    name: "StratosAgent", full: "Open-source runtime", category: "Intelligence Infrastructure", status: "PRODUCTION", tone: "prod",
    blurb: "Run autonomous intelligence locally — model routing, tools, workflows, identity, receipts, governance. Free forever.",
    href: "/stratos",
  },
  {
    name: "ECP", full: "Efficient Context Protocol", category: "Continuity Infrastructure", status: "PRODUCTION", tone: "prod",
    blurb: "Preserve and compound intelligence — manifests, ledgers, receipts, read models. Outputs become durable, reusable intelligence.",
    href: "/docs/concepts",
  },
  {
    name: "Governance Harness", full: "Trust infrastructure", category: "Trust Infrastructure", status: "ENFORCED", tone: "enforced",
    blurb: "Govern and prove every action — authority, approvals, protected-action gates, deny-by-default, audited denials.",
    href: "/docs/concepts",
  },
  {
    name: "Atmosphere", full: "Ownership infrastructure", category: "Ownership Infrastructure", status: "PRODUCTION", tone: "prod",
    blurb: "Replace cloud dependency with sovereign infrastructure — own your compute, context, memory and intelligence.",
    href: "/atmosphere",
  },
  {
    name: "ARI", full: "Autonomous Readiness Index", category: "Measurement Infrastructure", status: "MEASURED", tone: "measured",
    blurb: "Measure whether intelligence is ready for autonomy across eight dimensions — and what it costs.",
    href: "/score",
  },
  {
    name: "DOP", full: "Digital Organism Protocol", category: "Improvement Metabolism", status: "MEASURED", tone: "measured",
    blurb: "Records outcomes, evaluates work, promotes what proves value, prunes what decays — humans keep control of evolution.",
    href: "/docs/concepts",
  },
  {
    name: "Commerce", full: "Governed spend", category: "Financial Infrastructure", status: "ROADMAP", tone: "roadmap",
    blurb: "Govern budgets, wallets, approvals and settlement — financial accountability before autonomy touches money.",
    href: "/docs/concepts",
  },
];

// ARI's eight readiness dimensions (canon).
export const ARI_DIMENSIONS = [
  "Governance", "Ownership", "Continuity", "Security",
  "Economics", "Commerce", "Identity", "Infrastructure",
];
