// ============================================================================
// data/docs.ts — single source of truth for the /docs surface.
//
// Drives: the sidebar nav tree, the ⌘K search index, the prev/next pager order,
// breadcrumbs, and the per-article body. Article bodies are typed content blocks
// (no MDX dependency) rendered by app/docs/[slug]/page.tsx.
//
// HONESTY: capability status words come from data/status.json. Never write the
// word "live" for a capability the matrix marks wired/config-needed/standalone/mock — use a
// <StatusBadge> or a `planned` callout instead. The helpers below read the level
// straight out of status.json so the docs can't drift from the truth.
// ============================================================================
import statusData from "@/data/status.json";

export type StatusLevel = "live" | "wired" | "config" | "standalone" | "mock";

type StatusJson = {
  levels: Record<StatusLevel, { label: string; blurb: string }>;
  layers: { id: string; name: string; caps: { name: string; detail: string; level: StatusLevel }[] }[];
};

const STATUS = statusData as StatusJson;

/** Look up a capability's honest level by its exact name in status.json. */
export function capLevel(name: string): StatusLevel | null {
  for (const layer of STATUS.layers) {
    for (const cap of layer.caps) if (cap.name === name) return cap.level;
  }
  return null;
}

export function levelLabel(level: StatusLevel): string {
  return STATUS.levels[level].label;
}
export function levelBlurb(level: StatusLevel): string {
  return STATUS.levels[level].blurb;
}

// ── content block model ─────────────────────────────────────────────────────
export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string; id: string }
  | { kind: "h3"; text: string; id: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; lang: string; code: string }
  | { kind: "tabs"; tabs: { label: string; lang: string; code: string }[] }
  | { kind: "callout"; variant: "note" | "tip" | "warning" | "planned"; title?: string; text: string }
  | { kind: "status"; caps: string[] } // renders a list of caps with their honest badges
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "faq"; items: { q: string; a: string }[] };

export type Article = {
  slug: string;
  title: string;
  group: string;       // sidebar group label
  description: string; // used for <meta> + search
  keywords?: string[]; // extra search terms
  updated: string;     // ISO date for "last updated"
  blocks: Block[];
};

export type NavGroup = { label: string; slugs: string[] };

// ── inline markdown is NOT parsed; keep body prose plain. Links are expressed
//    as blocks or via the FAQ/callout text which the renderer linkifies for
//    a small set of internal anchors only. ───────────────────────────────────

// ============================================================================
// ARTICLES
// ============================================================================
export const ARTICLES: Article[] = [
  // ── GET STARTED ───────────────────────────────────────────────────────────
  {
    slug: "welcome",
    title: "Welcome",
    group: "Get started",
    description:
      "What Efficient Labs and the Atmosphere are, the sovereignty thesis, and the honest-status philosophy these docs are built on.",
    keywords: ["intro", "overview", "sovereignty", "thesis", "atmosphere", "stratosagent"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "Efficient Labs builds sovereign AI infrastructure: your agents, your hardware, your rules. StratosAgent is the agent that runs on a machine you own; the Atmosphere is the peer-to-peer mesh that connects those agents to the world without a central server that can seize, censor, or surveil them." },
      { kind: "h2", id: "the-thesis", text: "The sovereignty thesis" },
      { kind: "p", text: "Most AI runs on someone else's computer. That means someone else holds your keys, your context, and your kill switch. We invert that: compute and keys stay on hardware you control, peers connect directly over an encrypted mesh, and identity is content-addressed and post-quantum sealed. Nothing is exposed to the public internet — there are no inbound ports to attack." },
      { kind: "ul", items: [
        "Local-first — inference and secrets stay on your machine.",
        "Peer-to-peer — nodes hole-punch to each other; no broker server in the middle.",
        "Content-addressed — skills and receipts are identified by their hash, not a URL someone can swap.",
        "Post-quantum — signatures and seals use ML-DSA-65 today, not someday.",
      ] },
      { kind: "h2", id: "honest-status", text: "The honest-status philosophy" },
      { kind: "p", text: "These docs never claim a capability is further along than it is. Every feature inherits a status level from our public capability matrix, and that level is shown inline as a badge. The four levels are:" },
      { kind: "ul", items: [
        "Live — running in production, exercised by tests.",
        "Wired — built and connected into the daemon; hardening in progress.",
        "Standalone — built and tested in isolation; live wiring is supervised.",
        "Mock — scaffold or placeholder, explicitly NOT real yet.",
      ] },
      { kind: "callout", variant: "tip", title: "See it yourself", text: "The same matrix that drives these badges is published on the homepage. Check the live status board at /#status before you rely on anything." },
    ],
  },
  {
    slug: "quickstart",
    title: "Quickstart",
    group: "Get started",
    description: "The fastest path to a running StratosAgent — bring-your-own-key, local-first.",
    keywords: ["quickstart", "fast", "byok", "start", "first run"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "This is the shortest path from nothing to the publicly-auditable StratosAgent operating core running on your own machine. One command installs the CLI; the operating-core commands are deterministic and make no network calls." },
      { kind: "callout", variant: "note", text: "The installer is user-space and fail-closed: no sudo, nothing auto-started. It installs the pinned @efficientlabs/stratos package after checking for Node 20.19+." },
      { kind: "h2", id: "install-runtime", text: "1 · Install the CLI" },
      { kind: "tabs", tabs: [
        { label: "macOS / Linux", lang: "bash", code: "# install the StratosAgent CLI — user-space, no sudo\ncurl -fsSL https://efficientlabs.ai/install.sh | sh" },
        { label: "Windows", lang: "powershell", code: "# install the StratosAgent CLI — PowerShell, no admin\nirm https://efficientlabs.ai/install.ps1 | iex\n# or with npm (any OS): npm i -g @efficientlabs/stratos" },
      ] },
      { kind: "h2", id: "bring-online", text: "2 · First run — a real local completion" },
      { kind: "code", lang: "bash", code: "stratos init                              # persistent node identity + a workspace\nstratos task create local/demo/flow/t1    # scaffold a task\nstratos complete local/demo/flow/t1 \"what is sovereign AI?\"   # REAL local completion\nstratos eval local/demo/flow/t1           # re-verify the run's signed receipt" },
      { kind: "callout", variant: "note", text: "complete needs a local OpenAI-compatible endpoint — e.g. Ollama (ollama serve + ollama pull gemma2:2b) — pointed at via --gateway or STRATOS_GATEWAY_URL (e.g. http://127.0.0.1:11434/v1/chat/completions). No model is bundled; your data stays on your machine." },
      { kind: "p", text: "complete routes local-default ($0), writes a trace, and seals it in a PQC-signed capability-receipt verifiable with the public key alone. The deterministic, no-network commands — workspace / task / capture / trace / eval / route / receipt — need no endpoint at all." },
      { kind: "h2", id: "next", text: "Where to next" },
      { kind: "ul", items: [
        "Requirements — confirm your Node version and OS.",
        "Configure (Vault + BYOK) — seal secrets and set the cost gate.",
        "Verify your install — what a healthy node looks like.",
      ] },
    ],
  },
  {
    slug: "concepts",
    title: "Concepts",
    group: "Get started",
    description: "Content-addressing, capability isolation, post-quantum seals, and the four status levels.",
    keywords: ["concepts", "content-addressed", "capability", "isolation", "post-quantum", "levels"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "content-addressing", text: "Content-addressing" },
      { kind: "p", text: "Skills, receipts, and freshness are keyed by SHA-256 hashes rather than mutable URLs. If the bytes change, the address changes — so you can verify exactly what you ran. This pipeline is part of the engine today." },
      { kind: "status", caps: ["Content-addressed pipeline"] },
      { kind: "h2", id: "capability-isolation", text: "Capability isolation" },
      { kind: "p", text: "Child processes and sidecars are stripped of secrets, NODE_OPTIONS, and proxy credentials; execution runs in a sanitized WASI sandbox with empty preopens and no shell. A cost handshake (the 402 loop) gates any write. Most of this layer is connected into the daemon and hardening." },
      { kind: "status", caps: ["Broker env-scoping", "Exec + WASI sandbox", "Write-approval (402 loop)"] },
      { kind: "h2", id: "post-quantum-seals", text: "Post-quantum seals" },
      { kind: "p", text: "Skills and receipts carry ML-DSA-65 signatures, and secrets are sealed at rest with AES-GCM with derived keys zeroed after use. This substrate runs in production today." },
      { kind: "status", caps: ["Post-quantum receipts & seals", "Vault (AES-GCM, memory-wiped)"] },
      { kind: "h2", id: "status-levels", text: "The four status levels" },
      { kind: "p", text: "Everything in these docs is labeled with one of four honesty levels, sourced from the public capability matrix:" },
      { kind: "table", head: ["Level", "Meaning"], rows: [
        ["Live", "Running in production, exercised by tests."],
        ["Wired", "Built and connected into the daemon; hardening in progress."],
        ["Standalone", "Built and tested in isolation; live wiring is supervised."],
        ["Mock", "Scaffold / placeholder — explicitly NOT real yet."],
      ] },
    ],
  },

  // ── INSTALL STRATOSAGENT ────────────────────────────────────────────────
  {
    slug: "requirements",
    title: "Requirements",
    group: "Install StratosAgent",
    description: "Node versions, operating systems, and what you need before installing.",
    keywords: ["requirements", "node", "os", "prerequisites"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "runtime", text: "Runtime" },
      { kind: "p", text: "StratosAgent targets the same Node versions our hermetic CI runs against, so what passes in CI is what runs on your machine." },
      { kind: "table", head: ["Requirement", "Supported"], rows: [
        ["Node.js", "20 LTS or 22 LTS"],
        ["macOS", "13 Ventura or newer (Apple Silicon + Intel)"],
        ["Linux", "glibc-based distros, kernel 5.10+"],
        ["Windows", "10 / 11 (PowerShell 5.1+)"],
      ] },
      { kind: "status", caps: ["Hermetic CI"] },
      { kind: "h2", id: "model-key", text: "A model key" },
      { kind: "p", text: "StratosAgent is bring-your-own-key. You supply a key for your preferred provider; spend is gated locally before any request leaves your machine. See Configure (Vault + BYOK) for setup." },
    ],
  },
  {
    slug: "install",
    title: "Install",
    group: "Install StratosAgent",
    description: "Install the Atmosphere runtime and bring up a node on hardware you own.",
    keywords: ["install", "setup", "bundle", "mesh bundle"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "A single, fail-closed installer puts the StratosAgent CLI on your machine — user-space, no sudo, nothing auto-started. It checks for Node 20.19+ and installs the pinned @efficientlabs/stratos package." },
      { kind: "h2", id: "one-command", text: "One command" },
      { kind: "tabs", tabs: [
        { label: "macOS / Linux", lang: "bash", code: "curl -fsSL https://efficientlabs.ai/install.sh | sh" },
        { label: "Windows", lang: "powershell", code: "npm i -g @efficientlabs/stratos" },
      ] },
      { kind: "h2", id: "your-hardware", text: "Verify it runs" },
      { kind: "code", lang: "bash", code: "stratos --version\nstratos --help" },
      { kind: "p", text: "Everything installs and runs on hardware you already own. The operating-core commands (workspace / task / capture / trace / eval) are deterministic and make no network calls." },
      { kind: "h2", id: "mesh-bundles", text: "Per-platform mesh bundles" },
      { kind: "p", text: "Each platform ships a dedicated mesh bundle. These are built and connected; broad multi-device runs are still early, so treat large fan-out deployments as experimental." },
      { kind: "status", caps: ["Hyperswarm DHT + hole-punch"] },
      { kind: "callout", variant: "planned", title: "Broad multi-device", text: "Running many devices in one mesh at once is still being hardened. For now, start with one or two nodes you control." },
    ],
  },
  {
    slug: "configure",
    title: "Configure (Vault + BYOK)",
    group: "Install StratosAgent",
    description: "Seal secrets in the Vault, set the BYOK cost gate, and gate command authority to the owner.",
    keywords: ["configure", "vault", "byok", "cost gate", "owner", "secrets"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "vault", text: "Vault" },
      { kind: "p", text: "Secrets are sealed at rest with AES-GCM, and derived keys are zeroed from memory after use. Set a secret once and StratosAgent never writes it back out in plaintext." },
      { kind: "code", lang: "bash", code: "stratos vault set OPENAI_API_KEY   # prompts; sealed with AES-GCM\nstratos vault list                 # names only, never values" },
      { kind: "status", caps: ["Vault (AES-GCM, memory-wiped)"] },
      { kind: "h2", id: "byok", text: "BYOK cost gate" },
      { kind: "p", text: "All spend flows through a single route — /v1/chat/completions — guarded by a cost gate. Nothing else can spend on your behalf." },
      { kind: "status", caps: ["BYOK cost gate"] },
      { kind: "h2", id: "owner-gating", text: "Owner-gating (fail-closed)" },
      { kind: "p", text: "Command authority is owner-gated and fails closed: if no owner is set, the agent has no command authority at all. There is no implicit-trust default." },
      { kind: "status", caps: ["Owner-gating (fail-closed)"] },
    ],
  },
  {
    slug: "verify",
    title: "Verify your install",
    group: "Install StratosAgent",
    description: "What a healthy, running StratosAgent looks like, and how to confirm channel adapters are configured.",
    keywords: ["verify", "health", "status", "running", "channels"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "check-status", text: "Check status" },
      { kind: "code", lang: "bash", code: "stratos status\n\n# ✓ node active · meshed P2P · post-quantum keys sealed\n# → channel adapters: config needed until tokens are set" },
      { kind: "p", text: "A healthy node reports a sealed vault, a meshed transport, and the channel adapters that are configured for that node." },
      { kind: "h2", id: "channels", text: "Channel adapters" },
      { kind: "p", text: "Five channel adapters are built and daemon-started, but external tokens and real send/receive verification are still required before they count as live." },
      { kind: "status", caps: ["Channel adapters"] },
    ],
  },

  // ── THE ATMOSPHERE ───────────────────────────────────────────────────────
  {
    slug: "mesh-overview",
    title: "Mesh overview",
    group: "The Atmosphere",
    description: "Hyperswarm DHT plus hole-punch, with no open ports.",
    keywords: ["mesh", "hyperswarm", "dht", "hole-punch", "p2p", "transport"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "The Atmosphere is a peer-to-peer transport built on a Hyperswarm DHT with hole-punching. Nodes find each other and connect directly — there are no inbound ports to open and nothing exposed to the public internet." },
      { kind: "status", caps: ["Hyperswarm DHT + hole-punch"] },
      { kind: "callout", variant: "planned", title: "Broad multi-device", text: "Per-platform bundles are built and connected, but running many devices across one mesh at scale is still early. Treat large meshes as experimental for now." },
    ],
  },
  {
    slug: "gossip-skill-sync",
    title: "Gossip skill-sync",
    group: "The Atmosphere",
    description: "Peer-to-peer skill propagation with provenance, verified on ingest.",
    keywords: ["gossip", "skill-sync", "propagation", "provenance", "skill-seal"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "Skills propagate peer-to-peer across the mesh, carrying provenance with them. When a peer ingests a skill, its seal is verified before it is accepted — a tampered or unsigned skill is rejected at the door." },
      { kind: "status", caps: ["Gossip skill-sync", "Skill-seal verification on ingest"] },
    ],
  },
  {
    slug: "economic-settlement",
    title: "Economic settlement",
    group: "The Atmosphere",
    description: "Offline-signed settlement that is never broadcast. Explicitly a scaffold today.",
    keywords: ["settlement", "economic", "on-chain", "payments", "mock"],
    updated: "2026-06-03",
    blocks: [
      { kind: "callout", variant: "planned", title: "Not real yet", text: "Economic settlement is a scaffold. Nothing is broadcast anywhere, and there is no production settlement path. This page describes the intended design, not a shipped feature." },
      { kind: "p", text: "The intended model is offline-signed: settlement records are signed locally and exchanged peer-to-peer, never broadcast on-chain. We will not describe this as anything other than a scaffold until the matrix says otherwise." },
      { kind: "status", caps: ["Economic / on-chain settlement"] },
    ],
  },

  // ── INTEGRATIONS ──────────────────────────────────────────────────────────
  {
    slug: "channel-adapters",
    title: "Channel adapters",
    group: "Integrations",
    description: "Telegram, Discord, Slack, Matrix, and Signal adapters, with owner tokens required before they are live.",
    keywords: ["channels", "telegram", "discord", "slack", "matrix", "signal", "adapters"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "StratosAgent can reach users over five channel adapters once owner tokens are configured and send/receive verification passes." },
      { kind: "status", caps: ["Channel adapters"] },
      { kind: "h2", id: "telegram", text: "Telegram" },
      { kind: "p", text: "Pair a bot token in the Vault; the daemon starts the adapter on boot. Direct messages and groups are both supported, with owner-gating applied to commands." },
      { kind: "h2", id: "discord", text: "Discord" },
      { kind: "p", text: "Provide a bot token and the adapter joins your guilds. The same owner-gating and secret-guard rules apply to every message it sends." },
      { kind: "h2", id: "slack", text: "Slack" },
      { kind: "p", text: "Install the app and store its tokens in the Vault. StratosAgent responds in channels and DMs it is invited to." },
      { kind: "h2", id: "matrix", text: "Matrix" },
      { kind: "p", text: "Point the adapter at your homeserver and an access token. End-to-end rooms are honored where the homeserver supports them." },
      { kind: "h2", id: "signal", text: "Signal" },
      { kind: "p", text: "Link a Signal number through the adapter to reach StratosAgent over Signal, with the same local-first guarantees." },
    ],
  },
  {
    slug: "inference-routing",
    title: "Inference routing",
    group: "Integrations",
    description: "Local-versus-cloud language routing: coding stays local, complex work proxies out.",
    keywords: ["inference", "routing", "local", "cloud", "model", "proxy"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "Inference is routed by the kind of work: coding and routine tasks run against a local model, while complex requests proxy out to a cloud provider through the BYOK cost gate. This routing runs in production." },
      { kind: "status", caps: ["Local ⇄ cloud language routing", "BYOK cost gate"] },
      { kind: "callout", variant: "tip", text: "Because spend only flows through the BYOK cost gate, local routing costs you nothing — only proxied requests touch your provider key." },
    ],
  },
  {
    slug: "speech-vision",
    title: "Speech & vision",
    group: "Integrations",
    description: "STT/TTS adapters. Currently placeholders — a scaffold, not a shipped feature.",
    keywords: ["speech", "vision", "stt", "tts", "audio", "voice", "mock"],
    updated: "2026-06-03",
    blocks: [
      { kind: "callout", variant: "planned", title: "Placeholder only", text: "Speech and vision adapters return placeholders. There is no real STT/TTS or vision pipeline behind them yet. This page documents the intended shape, not a working feature." },
      { kind: "p", text: "The intent is for STT/TTS and vision to be processed locally on hardware you own. Until the matrix marks them otherwise, treat these adapters as scaffolds." },
      { kind: "status", caps: ["Speech & vision (STT/TTS)"] },
    ],
  },
  {
    slug: "acp",
    title: "Agent-to-agent (ACP)",
    group: "Integrations",
    description: "The agent-to-agent proxy returns scaffolded responses today.",
    keywords: ["acp", "agent-to-agent", "proxy", "mock"],
    updated: "2026-06-03",
    blocks: [
      { kind: "callout", variant: "planned", title: "Scaffolded responses", text: "The ACP agent-to-agent proxy returns scaffolded responses. It is not a working inter-agent protocol yet." },
      { kind: "p", text: "The design goal is structured agent-to-agent calls across the mesh, carrying capability scoping and provenance. For now it is explicitly a scaffold." },
      { kind: "status", caps: ["ACP agent-to-agent proxy"] },
    ],
  },

  // ── CLI REFERENCE ─────────────────────────────────────────────────────────
  {
    slug: "cli-overview",
    title: "Overview",
    group: "CLI reference",
    description: "Command groups and global flags for the stratos CLI.",
    keywords: ["cli", "commands", "flags", "stratos", "reference"],
    updated: "2026-06-03",
    blocks: [
      { kind: "p", text: "The stratos CLI is the single entry point for installing, running, and inspecting a node. Commands are grouped by subsystem." },
      { kind: "h2", id: "groups", text: "Command groups" },
      { kind: "table", head: ["Group", "Purpose"], rows: [
        ["install / up / init", "Bring the runtime and a node online."],
        ["vault", "Seal and list secrets."],
        ["skills", "Inspect and sync content-addressed skills."],
        ["status", "Report node health and channel adapters."],
      ] },
      { kind: "h2", id: "global-flags", text: "Global flags" },
      { kind: "table", head: ["Flag", "Effect"], rows: [
        ["--json", "Machine-readable output."],
        ["--quiet", "Suppress non-error output."],
        ["--help", "Show help for any command."],
      ] },
    ],
  },
  {
    slug: "cli-commands",
    title: "Commands",
    group: "CLI reference",
    description: "Per-command usage for install, up, vault, skills, and status.",
    keywords: ["commands", "usage", "vault", "skills", "status", "up"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "stratos-up", text: "stratos up" },
      { kind: "p", text: "Mesh into the Atmosphere and start configured channel adapters." },
      { kind: "code", lang: "bash", code: "stratos up [--quiet] [--json]" },
      { kind: "h2", id: "stratos-vault", text: "stratos vault" },
      { kind: "p", text: "Seal a secret (prompted), or list sealed names. Values are never printed." },
      { kind: "code", lang: "bash", code: "stratos vault set <NAME>\nstratos vault list" },
      { kind: "h2", id: "stratos-skills", text: "stratos skills" },
      { kind: "p", text: "List content-addressed skills and sync from peers. Seals are verified on ingest." },
      { kind: "code", lang: "bash", code: "stratos skills list\nstratos skills sync" },
      { kind: "h2", id: "stratos-status", text: "stratos status" },
      { kind: "p", text: "Report vault, transport, and channel-adapter health." },
      { kind: "code", lang: "bash", code: "stratos status [--json]" },
      { kind: "callout", variant: "note", text: "Commands that front a scaffolded subsystem (for example anything routing through ACP or speech/vision) carry the same Mock status as those subsystems — see Integrations." },
    ],
  },

  // ── ECONOMY ──────────────────────────────────────────────────────────────
  {
    slug: "wallet-contribution",
    title: "Wallet & contribution",
    group: "Economy",
    description:
      "Connect a wallet to reserve a contributor identity and track Contribution Credits before rewards go live. Tracking is active; payouts are not.",
    keywords: ["wallet", "contribution", "credits", "rewards", "payout", "economy", "tier", "pricing"],
    updated: "2026-06-06",
    blocks: [
      { kind: "callout", variant: "planned", title: "Tracking active · payouts not live", text: "You can connect a wallet to reserve your contributor identity and track Contribution Credits today. Rewards and payouts are NOT live — the payout layer is counsel-gated and ships last. Nothing here is a promised financial return." },
      { kind: "p", text: "Connecting a wallet is always optional and never required to use the product. We store a public address only — never a private key, never custody, never a deposit. Its only purpose is to attribute the contribution you make to the mesh so that, if and when a reward layer activates, your record already exists." },
      { kind: "h2", id: "what-is-a-credit", text: "What a Contribution Credit is" },
      { kind: "p", text: "A Contribution Credit is a transparent, receipt-backed record of contribution — compute you supplied to the mesh, and referrals that convert to paying subscribers. Credits are explicitly not money, not equity, and not a promised return. They are an accounting record governed by published program terms." },
      { kind: "ul", items: [
        "Compute supplied — measured by the capability-receipt rail (CPU / RAM / VRAM·time).",
        "Referrals — single-level, credited only when the referred user becomes a paying subscriber.",
        "Every credit is backed by a signed receipt you can audit — not a marketing number.",
      ] },
      { kind: "h2", id: "across-all-tiers", text: "Across every tier" },
      { kind: "p", text: "Wallet connect and contribution tracking are available on all tiers — Free, Pro, Builder, Team, and Enterprise. Higher tiers scale node limits, skill publishing, and business controls; the contribution-accounting layer is the same everywhere." },
      { kind: "h2", id: "settlement-status", text: "Settlement status" },
      { kind: "p", text: "The economic / settlement layer is a scaffold today. Settlement records are designed to be offline-signed and never broadcast; there is no production payout path and no chain is touched. We will not describe payouts as anything other than not-live until the capability matrix says otherwise." },
      { kind: "status", caps: ["Economic / on-chain settlement"] },
      { kind: "callout", variant: "warning", title: "No return is promised", text: "We never say \"earn SOL today,\" \"guaranteed passive income,\" or \"invest in the Atmosphere.\" Contribution Credits are a record of contribution under published terms — not an investment, and not a guarantee of any payment." },
    ],
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────
  {
    slug: "faq",
    title: "FAQ",
    group: "FAQ",
    description: "Straight answers about what is decentralized, what runs locally, and what is real today.",
    keywords: ["faq", "questions", "decentralized", "local", "broadcast", "security"],
    updated: "2026-06-03",
    blocks: [
      { kind: "faq", items: [
        { q: "Is this actually decentralized?", a: "The transport is peer-to-peer over a Hyperswarm DHT with hole-punching, and there is no central broker server in the data path. Per-platform bundles are built and connected; broad multi-device meshes are still early, so we call that part Wired, not Live." },
        { q: "What runs locally versus proxied?", a: "Coding and routine work run against a local model. Complex requests proxy out to a cloud provider through the BYOK cost gate. Spend only happens on that single gated route." },
        { q: "Do you broadcast anything on-chain?", a: "No. Economic settlement is designed to be offline-signed and never broadcast, and today it is an explicit scaffold (Mock). Nothing is published to any chain." },
        { q: "What is real today?", a: "Check the published capability matrix at /#status. Anything not marked Live there is shown in these docs with a Wired, Standalone, or Mock badge — we do not call scaffolds shipped." },
        { q: "How do I report security issues?", a: "Email hello@efficientlabs.ai with details. Secrets are sealed in the Vault and outbound text is scrubbed of secret-shaped strings, but responsible disclosure is always welcome." },
        { q: "Do I earn money or payouts by connecting a wallet?", a: "No — not today. You can connect a wallet to reserve a contributor identity and track Contribution Credits, but the reward / payout layer is not live (it is counsel-gated and ships last). Credits are a receipt-backed record of contribution under published terms, not money and not a promised return. See Wallet & contribution." },
      ] },
    ],
  },
];

// ============================================================================
// NAV TREE (groups in display order; slugs in linear order for the pager)
// ============================================================================
export const NAV: NavGroup[] = [
  { label: "Get started", slugs: ["welcome", "quickstart", "concepts"] },
  { label: "Install StratosAgent", slugs: ["requirements", "install", "configure", "verify"] },
  { label: "The Atmosphere", slugs: ["mesh-overview", "gossip-skill-sync", "economic-settlement"] },
  { label: "Integrations", slugs: ["channel-adapters", "inference-routing", "speech-vision", "acp"] },
  { label: "CLI reference", slugs: ["cli-overview", "cli-commands"] },
  { label: "Economy", slugs: ["wallet-contribution"] },
  { label: "FAQ", slugs: ["faq"] },
];

// ── derived helpers ─────────────────────────────────────────────────────────
const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
export function getArticle(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}

/** Linear order across all groups — drives prev/next. */
export const FLAT_ORDER: string[] = NAV.flatMap((g) => g.slugs);

export function getPager(slug: string): { prev?: Article; next?: Article } {
  const i = FLAT_ORDER.indexOf(slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? getArticle(FLAT_ORDER[i - 1]) : undefined,
    next: i < FLAT_ORDER.length - 1 ? getArticle(FLAT_ORDER[i + 1]) : undefined,
  };
}

/** Flat search index for the ⌘K palette. Page-level entries plus section-level
 *  (h2/h3) entries so search can deep-link to an anchor within a page. */
export type SearchEntry = {
  slug: string;
  title: string;
  group: string;
  description: string;
  keywords: string[];
  anchor?: string;   // present on section-level entries → /docs/{slug}#{anchor}
  section?: string;  // the parent article title, shown as context
};
export const SEARCH_INDEX: SearchEntry[] = ARTICLES.flatMap((a) => {
  const page: SearchEntry = {
    slug: a.slug,
    title: a.title,
    group: a.group,
    description: a.description,
    keywords: a.keywords ?? [],
  };
  const sections: SearchEntry[] = a.blocks
    .filter((b): b is Extract<Block, { kind: "h2" | "h3" }> => b.kind === "h2" || b.kind === "h3")
    .map((h) => ({
      slug: a.slug,
      title: h.text,
      group: a.group,
      description: a.description,
      keywords: a.keywords ?? [],
      anchor: h.id,
      section: a.title,
    }));
  return [page, ...sections];
});

/** Headings (h2/h3) for an article — drives the on-this-page TOC. */
export type Heading = { id: string; text: string; level: 2 | 3 };
export function getHeadings(article: Article): Heading[] {
  const out: Heading[] = [];
  for (const b of article.blocks) {
    if (b.kind === "h2") out.push({ id: b.id, text: b.text, level: 2 });
    else if (b.kind === "h3") out.push({ id: b.id, text: b.text, level: 3 });
  }
  return out;
}
