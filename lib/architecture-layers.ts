/* The seven layers we actually built — single source of truth for both the
   cinematic film (ArchitectureFilm) and the Canvas fallback (ArchitectureSequence).
   Names + one-liners verbatim from PRODUCT_ARCHITECTURE_V2; maturity never rounded up.
   `full` spells out the acronyms (people don't know what ECP/DOP/ARI are); `cta`
   sends them to the most relevant real page for more detail. */

export type Tone = "prod" | "enforced" | "measured";

export const TONE: Record<Tone, { hex: string; label: string }> = {
  prod: { hex: "#3ddc97", label: "Production" },
  enforced: { hex: "#8b5cf6", label: "Enforced" },
  measured: { hex: "#22d3ee", label: "Measured" },
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
    n: "01", name: "Atmos", full: "The Universal Intelligence Environment", role: "The environment", status: "PRODUCTION", tone: "prod",
    blurb: "Your owned environment for agents, models, files, workflows, receipts, terminal access and governance — the file system is the source of truth.",
    cta: { label: "Explore Atmos", href: "/atmosphere" },
  },
  {
    n: "02", name: "ECP", full: "Efficient Context Protocol", role: "The context", status: "PRODUCTION", tone: "prod",
    blurb: "The filesystem becomes the agent architecture — manifests make it machine-readable, the compiler loadable, ledgers compaction-proof, receipts provable.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "03", name: "StratosAgent", full: "Open-source execution runtime", role: "The runtime", status: "PRODUCTION", tone: "prod",
    blurb: "Governed hands for AI agents: CLI, terminal, tools, workflows, receipts, safe execution boundaries. Free forever, open source.",
    cta: { label: "Get StratosAgent", href: "/stratos" },
  },
  {
    n: "04", name: "Governance Harness", full: "Authority & safety envelope", role: "The authority", status: "ENFORCED", tone: "enforced",
    blurb: "Every action bounded by authority, permissions, approvals and protected-action gates — deny-by-default, the denial audited.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
  {
    n: "05", name: "Receipts", full: "Signed, verifiable proof", role: "The proof", status: "PRODUCTION", tone: "prod",
    blurb: "Signed, hash-chained evidence for autonomous work. Not “trust me” — verify it with a public key, in your browser.",
    cta: { label: "Verify a receipt", href: "/status" },
  },
  {
    n: "06", name: "ARI", full: "Autonomous Readiness Index", role: "The readiness", status: "MEASURED", tone: "measured",
    blurb: "Owned, governed, verifiable, cost-aware, continuous, ready for autonomy? The runtime score is live; the full 12-dimension index renders honest-null where not yet instrumented.",
    cta: { label: "Run your readiness index", href: "/score" },
  },
  {
    n: "07", name: "DOP", full: "Digital Organism Protocol", role: "The metabolism", status: "MEASURED", tone: "measured",
    blurb: "Records outcomes, evaluates work, promotes what proves value, prunes what decays — humans keep control of evolution.",
    cta: { label: "See the docs", href: "/docs/concepts" },
  },
];
