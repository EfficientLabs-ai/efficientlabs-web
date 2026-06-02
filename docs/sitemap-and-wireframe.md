# Efficient Labs — Sitemap & Wireframe

> Source of truth for the public web surface. The apex marketing site (this repo) is one
> node; the rest of the surface is split across subdomains by **trust boundary**, not by
> convenience. Content variants are *paths*; trust boundaries are *subdomains*.
> Status: apex v1 BUILT (this repo). Subdomains = planned, not yet provisioned.

---

## 1. Sitemap

### 1.1 Apex — `efficientlabs.ai` (this repo · Next.js 16, static)
The cinematic single-page narrative + a few support routes.

```
efficientlabs.ai
├── /                      Home — cinematic scroll narrative (BUILT)
│   ├── #hero              r3f camera-dive: mesh → sovereign node → L0–L5 unfold
│   ├── #architecture      Thesis: "automate the file architecture, not the AI wrapper"
│   ├── #atmosphere        Act 01 — Content addressing (live sha256)
│   │                      Act 02 — NAT hole-punch (animated)
│   ├── #stratos           Act 03 — Capability, not secret
│   │                      Act 04 — Sealed skills + gossip
│   ├── #status            Act 05 — The honest status matrix (L0–L5)
│   └── (cta + footer)
├── /manifesto             Long-form: the sovereignty thesis + CS lineage   [PLANNED]
├── /pricing               AI Sovereignty Audit — $797 / $1,497 / Bespoke   [PLANNED]
├── /audit                 Audit intake (links to existing Tally 81R2zr)    [PLANNED]
├── /legal/{privacy,terms,bsl}   BSL 1.1 + policy pages                     [PLANNED]
└── /og/*                  Open-graph image routes                          [PLANNED]
```

### 1.2 Subdomain map (trust boundaries)

| Subdomain | Purpose | Framework | Trust boundary | Status |
|---|---|---|---|---|
| `efficientlabs.ai` | Marketing / first impression | Next.js (static) | Public, read-only | **BUILT** |
| `docs.` | Architecture docs + L0–L5 reference, file-as-source | Astro Starlight / Nextra | Public, read-only | Planned |
| `status.` | Live system health + uptime; the honest-status feed | Static + cron JSON | Public, read-only | Planned |
| `api.` | StratosAgent gateway (`/v1/*`, cost-gated) | existing bridge :4099 | Authenticated, spend | Live (backend) |
| `platform.` | Operator dashboard / control plane | app (auth) | Operator-only | Planned |
| `install.` | One-line installer + signed bundles per platform | static + R2 | Public, integrity-checked | Planned |
| `relay.` | Hyperswarm DHT bootstrap / relay info | static | Public | Planned |
| `n8n.` `crm.` `inbox.` `clients.` | Internal ops surfaces | existing | Operator / client auth | Live/varies |

**Rule:** anything that can *spend*, *mutate*, or *see operator data* lives behind its own
subdomain with its own auth — never a path on the marketing apex. Reference brands for this
split: Tailscale, Supabase (changelog-as-trust), Resend, libp2p/IPFS/Holepunch.

---

## 2. Wireframe — apex `/` (desktop, 1440px)

Legend: `▓` = WebGL/canvas · `[ ]` = button · `——` = hairline divider

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ◇ Efficient Labs      The Atmosphere  StratosAgent  Architecture  Status   │  NAV (fixed)
│                                                       [ Read the architecture ]│  transparent → blur on scroll
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   SOVEREIGN AI INFRASTRUCTURE                          ▓▓▓ 3D node mesh ▓▓▓   │  HERO  (h-320vh,
│                                                      ▓▓▓▓ • sovereign ▓▓▓▓    │  sticky canvas)
│   The sovereign                                       ▓▓▓▓▓▓ node ▓▓▓▓▓▓▓     │
│   internet for                                        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        │  scroll progress p:
│   AI agents.            ← aurora gradient on key line  ▓▓▓▓▓▓▓▓▓▓▓           │  0.0  mesh + headline
│                                                                              │  0.4→ camera dives
│   StratosAgent runs on hardware you own. …                                   │  0.7→ core dissolves
│                                                                              │  0.9  L0–L5 rings +
│   [ Enter the Atmosphere → ]   [ See the honest status ]                     │       legend fade in
│                                                                              │
│                          ↓ DESCEND INTO A NODE                               │
├────────────────────────────────────────────────────────────────────────────┤
│  THE THESIS                                                                   │  THESIS strip
│  Automate the file architecture, not the AI wrapper.                          │
│  Agents are expensive glue. A correct file/dataflow architecture …           │
├────────────────────────────────────────────────────────────────────────────┤
│  01 — CONTENT ADDRESSING            ┌─ skill.json (editable) ───────────┐    │  ACT 01
│  The address is the content.        │ { "skill": "audit.classify", … }  │    │  (live sha256,
│  Edit the block, watch it re-derive │ addr → be0cb118…0317d5  [immutable]│    │   2-col)
│                                     └───────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────────────────┤
│        ┌─ Hyperswarm DHT ─┐              02 — NAT TRAVERSAL                   │  ACT 02
│   [NAT]·peer ··· [NAT]·peer              No open ports. Ever.                 │  (animated SVG,
│        └── direct · encrypted ──┘        Two nodes rendezvous, hole-punch …   │   reversed cols)
├────────────────────────────────────────────────────────────────────────────┤
│  03 — OBJECT-CAPABILITY SECURITY                                              │  ACT 03
│  A capability, not a secret.                                                  │  (2 contrast cards)
│  ┌ bearer secret (ambient) ─┐   ┌ capability token (scoped) ─┐               │
│  │ ✕ grants everything …    │   │ ✓ one verb, one use …       │               │
│  └──────────────────────────┘   └─────────────────────────────┘             │
├────────────────────────────────────────────────────────────────────────────┤
│  04 — SEALED SKILLS · GOSSIP                ◦——◦                              │  ACT 04
│  Trust travels with the seal.          ◦——◦    ◦  (gossip graph,             │  (graph SVG)
│  ML-DSA sealed at origin, gossips …       tampered ✕ rejected)               │
├────────────────────────────────────────────────────────────────────────────┤
│  05 — THE HONEST STATUS                                                       │  ACT 05
│  What's real. What's not yet.                                                 │  (status matrix)
│  ● Live  ● Wired  ● Standalone  ● Mock                                        │
│  ┌ L0 Substrate ── Vault [Live] · PQC seals [Live] · Secret-guard [Live] ─┐  │
│  ┌ L1 … ┐ ┌ L2 … [Mock on-chain] ┐ ┌ L3 … ┐ ┌ L4 … ┐ ┌ L5 … [Mock STT] ┐    │
├────────────────────────────────────────────────────────────────────────────┤
│              Sovereignty isn't a feature. It's the foundation.               │  CTA
│              [ Enter the Atmosphere → ]   [ Read the architecture ]           │
├────────────────────────────────────────────────────────────────────────────┤
│  ◇ Efficient Labs        content-addressed · capability-secured · post-quantum│  FOOTER
└────────────────────────────────────────────────────────────────────────────┘
```

### Responsive (≤768px)
- Nav collapses to logo + hamburger (menu = the 4 anchors); CTA hidden, moves into menu.
- Hero: headline `clamp()` scales down; 3D mesh stays full-bleed, layer legend stacks
  *below* headline; dive distances unchanged (scroll-driven).
- All 2-col acts (`lg:grid-cols-2`) stack to 1 col; SVG demos go full-width above text.
- Status matrix: layer label row stacks above its capability list (`md:grid-cols-[180px_1fr]` → 1col).
- `prefers-reduced-motion`: 3D dive freezes at p=0 pose; reveals become instant; packets stop.

### Component inventory (built)
`Nav` (scroll-aware) · `MeshHero3D` (r3f scene + scroll driver + 2 HTML overlays) ·
`Reveal` / `ActHeader` (Motion scroll-in) · acts: `ContentAddress` `HolePunch`
`Capability` `SkillSeal` `StatusMatrix` · `lib/status.ts` (single source of truth).
Fallback `MeshCanvas` (2D) retained for low-power / reduced-motion.
```
```
