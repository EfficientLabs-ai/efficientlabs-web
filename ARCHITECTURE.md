# efficientlabs-web — Architecture

**Date:** 2026-06-06 · **Status:** architecture reference (mixed CURRENT / TARGET)

This repo is two surfaces in one Next.js app:

1. **The public marketing site** (apex `efficientlabs.ai`) — the "quantum aurora" cinematic site
   that tells the Atmosphere thesis.
2. **TheAtmosphere OS** — the `/app` control plane, the **interface (face) layer** of the Atmosphere
   AI Operating System. Substrate (`atmos-core`) and hands (`stratos-agent`) live in
   `~/atmosphere-core`; this is the face. See the canonical per-component spec at
   `/opt/efficient-labs/context/architecture/theatmosphere-operating-architecture.md`, the vision at
   `/opt/efficient-labs/context/product_vision/atmosphere-ai-operating-system.md`, and the repo
   reality docs `~/atmosphere-core/{NORTH_STAR,STATE_OF_REALITY,STATE_OF_THE_ATMOSPHERE,STRATOS_ULTIMATE_SPEC}.md`.

> **Honesty rule (the brand).** Every capability is **CURRENT** (in code — cited) or **TARGET**
> (specified, not built). This is not a convention — it is **enforced at build time**:
> `scripts/honesty-guard.mjs` runs on `prebuild` and **fails the build (exit 1)** if marketing copy
> describes a not-yet-`live` capability as live/available/shipping. The single source of truth is
> `data/status.json`.

---

## Stack (CURRENT)

- **Next.js 16.2.7** (App Router) + **React 19.2** + **TypeScript** (`package.json`).
  ⚠️ This Next.js has breaking changes vs older releases — see `AGENTS.md`; read
  `node_modules/next/dist/docs/` before editing framework-touching code.
- **Tailwind v4** (`postcss.config.mjs`, `app/globals.css` design tokens like `--color-signal`,
  `--color-void-2`, `--color-quantum`).
- **Motion 12** + **GSAP 3** for scroll/animation; **three** + `@react-three/fiber` + `drei` for the
  3D mesh hero (`components/MeshHero3D.tsx`, `MeshCanvas.tsx`).
- **lucide-react v1** for icons (note: v1 has no GitHub glyph — `GitBranch` is used as a stand-in).
- **@supabase/supabase-js** for auth (preview-safe; see below).

## Routing & hosting (CURRENT)

- **`proxy.ts`** sets indexing policy by host: the apex (`efficientlabs.ai` / `www`) is indexable;
  every other host (staging / preview / `*.vercel.app`) gets a hard `X-Robots-Tag: noindex`
  (fails closed to noindex on a missing host). It also redirects the vanity host
  `dashboard.efficientlabs.ai/` → `/ops` (the gated founder dashboard).
- Deploy target: **Vercel** (`.vercel/`). The `/app` and `/dashboard` layouts additionally carry a
  per-route `robots: noindex` (private control planes).

## Top-level routes (CURRENT)

| Route | What it is | Component(s) |
| :-- | :-- | :-- |
| `/` | marketing home — cinematic acts | `app/page.tsx`, `components/acts/*`, `MeshHero3D` |
| `/atmosphere`, `/stratos` | product narrative pages | `components/StratosAgent.tsx`, `Solutions.tsx` |
| `/architecture` | public architecture story | `components/Architecture.tsx` |
| `/pricing` | pricing | `components/Pricing.tsx` |
| `/status` | the L0–L5 honesty matrix | `lib/status.ts` ← `data/status.json` |
| `/docs`, `/docs/[slug]` | docs | `data/docs.ts`, `components/docs/*` |
| `/updates` | public changelog | `data/updates.json` |
| `/install` | node install | `components/Install.tsx` |
| `/login`, `/signup` | auth | `components/AuthForm.tsx` |
| `/dashboard` | customer control plane (noindex) | `app/dashboard/*` |
| `/ops`, `/ops/login` | gated founder dashboard | `lib/ops-auth.ts`, `app/api/ops-login` |
| `/app/**` | **TheAtmosphere OS** | `components/os/*` (below) |

## TheAtmosphere OS — `/app` (the focus of this repo's OS work)

The full per-module CURRENT/TARGET breakdown is in
`/opt/efficient-labs/context/architecture/theatmosphere-operating-architecture.md`. Summary of the
on-disk structure:

**Shell & primitives — `components/os/`**
- `OsShell.tsx` — the frame (sidebar + topbar + drawer + content); owns auth via `useOsSession`,
  provides session through `OsSessionProvider`.
- `OsSidebar.tsx` / `OsTopBar.tsx` / `OsMobileDrawer.tsx` — navigation chrome.
- `modules.ts` — `OS_MODULES`, the single source of the 11-module sidebar order + `isActiveModule()`.
- `useOsSession.ts` — auth truth; degrades to signed-out **preview** when Supabase is unconfigured
  (`lib/supabase.ts` → client is `null`, never throws).
- Building blocks: `OsCard`, `StatPill`, `StatusChip`, `EmptyState`, `ComingSoon`, `ConnectRow`,
  `ModuleHeader`.

**Modules — `app/app/*/page.tsx`** (Home, Agents, Workflows, Projects, Skills, Integrations, Memory,
Atmosphere, Wallet, Rewards, Settings). Each page is **honest by construction**: capabilities that are
genuinely live on the daemon are badged (`statusLevel` / `CapStatus`) from `data/status.json`;
everything that would need real account/daemon data renders a Preview / `EmptyState` / `ComingSoon`
state and **never fabricates a number**.

**Why no live agent data on the web:** the StratosAgent daemon runs on **hardware the user owns**, not
on our servers. So `/app` is a *remote control plane*, not the engine — the conversation, memory,
keys, and mesh nodes live on the user's machine. This is the architectural reason the modules show
preview/zero states rather than inventing telemetry.

## The honesty moat (CURRENT — enforced)

```
data/status.json        ← single source of truth (levels: live | wired | standalone | mock)
   │
   ├─ lib/status.ts            → /status page (LAYERS, LEVELS)
   ├─ components/docs/StatusBadge.tsx (CapStatus → capLevel(name)) → badges across /app + /docs
   └─ scripts/honesty-guard.mjs (prebuild) → FAILS BUILD if copy overclaims a non-live cap
scripts/ship.mjs        ← the ONLY promoter: flips a cap's level, appends to updates.json, notifies
```

Status levels map to this doc's grounding: `live`/`wired` ≈ **CURRENT**, `standalone` ≈
**CURRENT (supervised)**, `mock` ≈ **TARGET**.

## Auth (CURRENT, preview-safe)

`lib/supabase.ts` reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable by
design — no secret handled client-side). Unset ⇒ `supabase === null`, `authReady === false`, and both
`/app` and `/dashboard` degrade to a signed-out preview. The `/ops` founder dashboard uses a separate
server-side gate (`lib/ops-auth.ts`, `app/api/ops-login/route.ts`).

## Current-vs-Target — one line

The **marketing site, the `/app` OS shell + navigation + preview-safe auth, the L0–L5 honesty matrix,
and every capability badge** are CURRENT and build-time-enforced for honesty; the **live,
account-and-daemon-backed state of each OS module** (populated workspaces, run lists, transcripts, mesh
node figures, OAuth connections, in-app approval queue, payouts) is **TARGET**, specified by each
page's zero-states and never claimed live until the daemon link is wired.
