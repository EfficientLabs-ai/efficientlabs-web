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
    description: "The fastest path to a running StratosAgent — your own AI accounts, local-first.",
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
        "Configure (Vault + your own AI accounts) — seal secrets and set the cost gate.",
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
      { kind: "p", text: "StratosAgent works with your own AI accounts — your keys, your bills, no middleman. You supply a key for your preferred provider; spend is gated locally before any request leaves your machine. See Configure (Vault + your own AI accounts) for setup." },
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
    title: "Configure (Vault + your own AI accounts)",
    group: "Install StratosAgent",
    description: "Seal secrets in the Vault, set the cost gate on your own AI accounts, and gate command authority to the owner.",
    keywords: ["configure", "vault", "byok", "cost gate", "owner", "secrets"],
    updated: "2026-06-03",
    blocks: [
      { kind: "h2", id: "vault", text: "Vault" },
      { kind: "p", text: "The published stratos CLI never handles your provider keys at all: completions go through YOUR gateway via STRATOS_GATEWAY_URL, so the key stays wherever your endpoint keeps it. On a full Atmosphere node, provider keys are sealed in the runtime's vault (AES-256-GCM, machine-local 0600 master key, derived keys zeroed after use) during the daemon's setup — config stores only an opaque handle; the plaintext key never appears in config, env, or logs." },
      { kind: "code", lang: "bash", code: "# the CLI's spend path is bring-your-own-endpoint:\nSTRATOS_GATEWAY_URL=http://127.0.0.1:11434/v1/chat/completions \\\n  stratos complete <ws/proj/wf/task> \"prompt\" --model gemma2:2b" },
      { kind: "status", caps: ["Vault (AES-GCM, memory-wiped)"] },
      { kind: "h2", id: "byok", text: "Cost gate (your own AI accounts)" },
      { kind: "p", text: "All spend flows through a single route — /v1/chat/completions — guarded by a cost gate. Nothing else can spend on your behalf." },
      { kind: "status", caps: ["Cost gate (your own AI accounts)"] },
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
      { kind: "h2", id: "check-status", text: "Run the doctor" },
      { kind: "code", lang: "bash", code: "stratos doctor\n\n# ✓ node runtime   v22.x\n# ✓ node identity  did:atmos:…\n# ✓ workspaces     1 workspace(s): local\n# ✓ receipts       N receipt(s), chain verifies (public key only)\n# ! model gateway  STRATOS_GATEWAY_URL is not set\n#   → point it at any OpenAI-compatible endpoint …" },
      { kind: "p", text: "stratos doctor is read-only — it reports five checks (runtime, identity, workspaces, receipt chain, model gateway) and suggests the exact next command for anything that is not green. It never changes anything. A tampered receipt chain fails doctor: tamper-evidence is a diagnostic, not a surprise." },
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
      { kind: "p", text: "Inference is routed by the kind of work: coding and routine tasks run against a local model, while complex requests proxy out to a cloud provider through the cost gate on your own account. This routing runs in production." },
      { kind: "status", caps: ["Local ⇄ cloud language routing", "Cost gate (your own AI accounts)"] },
      { kind: "callout", variant: "tip", text: "Because spend only flows through the cost gate, local routing costs you nothing — only proxied requests touch your provider key." },
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
      { kind: "p", text: "The stratos CLI is the publicly-auditable operating core: thirteen commands, deterministic where promised, no telemetry. This reference matches the published package exactly — every command here exists; nothing here is aspirational." },
      { kind: "h2", id: "groups", text: "Command groups" },
      { kind: "table", head: ["Group", "Purpose"], rows: [
        ["init / doctor", "Set up this node (identity + workspace) and check its health, read-only."],
        ["workspace / task / capture", "The files-first operating core — deterministic, no LLM, no network."],
        ["complete / trace / eval", "Run real work through YOUR gateway with a signed receipt spine, then score it."],
        ["skill", "SKILL.md portability — import/export/list, untrusted by default."],
        ["route", "The local-default routing decision, explained — no call is made."],
        ["receipt", "Export and verify receipt bundles — public key only, offline-capable."],
      ] },
      { kind: "h2", id: "global-flags", text: "Global flags" },
      { kind: "table", head: ["Flag", "Effect"], rows: [
        ["--version / -v", "Print the version."],
        ["--help / -h", "Show help (also: stratos <command> help)."],
      ] },
    ],
  },
  {
    slug: "cli-commands",
    title: "Commands",
    group: "CLI reference",
    description: "Per-command usage for init, doctor, the operating core, completion, and receipts — verified against the published package.",
    keywords: ["commands", "usage", "init", "doctor", "complete", "trace", "eval", "receipt", "route"],
    updated: "2026-06-13",
    blocks: [
      { kind: "h2", id: "stratos-init", text: "stratos init" },
      { kind: "p", text: "Set up this node: a persistent identity (keys generated locally, sealed) and a default workspace. Idempotent; re-run to add provider keys." },
      { kind: "code", lang: "bash", code: "stratos init [workspace]   # default workspace name: local" },
      { kind: "h2", id: "stratos-doctor", text: "stratos doctor" },
      { kind: "p", text: "Read-only health report: runtime, identity, workspaces, receipt chain (fail-closed verify), model gateway. Suggests the exact next command for anything not green; never fixes, never writes." },
      { kind: "code", lang: "bash", code: "stratos doctor" },
      { kind: "h2", id: "stratos-task", text: "stratos workspace · task · capture" },
      { kind: "p", text: "The deterministic core: create a workspace, scaffold a task (8 canonical entries), classify and persist a context record. No LLM, no network." },
      { kind: "code", lang: "bash", code: "stratos workspace create <name>\nstratos task create <ws/proj/wf/task>\nstratos capture <ws/proj/wf/task> \"<text>\"" },
      { kind: "h2", id: "stratos-complete", text: "stratos complete" },
      { kind: "p", text: "A real local completion through YOUR gateway, with a PQC-signed receipt. Point STRATOS_GATEWAY_URL at any OpenAI-compatible endpoint and name a model your server actually has." },
      { kind: "code", lang: "bash", code: "STRATOS_GATEWAY_URL=http://127.0.0.1:11434/v1/chat/completions \\\n  stratos complete <ws/proj/wf/task> \"your prompt\" --model gemma2:2b" },
      { kind: "h2", id: "stratos-trace-eval", text: "stratos trace · eval" },
      { kind: "p", text: "trace runs start → steps → end with a signed receipt spine; eval scores the trace against the deterministic rubric (weighted, trace-integrity counts double)." },
      { kind: "code", lang: "bash", code: "stratos trace <ws/proj/wf/task>\nstratos eval <ws/proj/wf/task>" },
      { kind: "h2", id: "stratos-receipt", text: "stratos receipt" },
      { kind: "p", text: "Export a signed receipt JSONL as a self-contained bundle (public key embedded), and verify any bundle — offline, public key only, exact break index on tamper." },
      { kind: "code", lang: "bash", code: "stratos receipt export <receipts.jsonl> --out bundle.json\nstratos receipt verify bundle.json" },
      { kind: "h2", id: "stratos-skill-route", text: "stratos skill · route" },
      { kind: "p", text: "skill imports/exports SKILL.md files (untrusted by default — capabilities must be granted). route prints the local-default routing decision and the why, without making a call." },
      { kind: "code", lang: "bash", code: "stratos skill import <file.md>\nstratos route \"<prompt>\" [--privacy]" },
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
      { kind: "p", text: "Wallet connect and contribution tracking are available on all tiers — Free Forever, Exos Pro, Apex, Apex Max, Teams, and Enterprise. Higher tiers scale node limits, skill publishing, and business controls; the contribution-accounting layer is the same everywhere." },
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
        { q: "What runs locally versus proxied?", a: "Coding and routine work run against a local model. Complex requests proxy out to a cloud provider through the cost gate on your own account. Spend only happens on that single gated route." },
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
