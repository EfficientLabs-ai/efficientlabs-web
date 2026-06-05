# efficientlabs-web — Context Routing

**Date:** 2026-06-06 · **Status:** routing map (mixed CURRENT / TARGET)

How information flows **into**, **through**, and **out of** this repo, and how that maps onto the
Atmosphere pipeline `Input → Capture → Classify → Route → Store → Execute → Trace → Evaluate →
Compress → Improve` (`/opt/efficient-labs/context/architecture/CONTEXT_CAPTURE_SCHEMA.md`) and the
operational unit `Workspace > Project > Workflow > Task > Subtask`
(`/opt/efficient-labs/context/decisions/agent-framework-abstraction-layer.md`).

Two distinct kinds of "context" route here. Keep them separate.

---

## A. Capability/status context — the honesty spine (CURRENT, enforced)

This is the load-bearing routing in the repo today. Every claim the site makes about what the system
can do is routed from one file, so the UI cannot drift ahead of reality.

```
                         data/status.json   ← SINGLE SOURCE OF TRUTH
                         (levels: live | wired | standalone | mock)
                                  │
        ┌─────────────────────────┼───────────────────────────────────┐
        ▼                         ▼                                     ▼
   lib/status.ts          components/docs/StatusBadge.tsx        scripts/honesty-guard.mjs
   (LAYERS, LEVELS)        CapStatus → capLevel(name)            (prebuild tripwire)
        │                         │                                     │
        ▼                         ▼                                     ▼
   /status page          badges across /app modules + /docs       FAILS BUILD (exit 1) if
   (L0–L5 matrix)        (Agents, Skills, Memory, …)              copy overclaims a non-live cap
```

- **Where levels come in:** the operator/`scripts/ship.mjs` flips a capability's level when it
  genuinely ships. `ship.mjs` is the **only** promoter — it edits `data/status.json`, appends to
  `data/updates.json` (public changelog → `/updates`), queues content, and notifies the audience.
- **Where levels go out:** `/status` (full matrix), inline `CapStatus`/`StatusBadge` badges in every
  `/app` module and in `/docs`, and the marketing copy that `honesty-guard` polices.
- **Routing rule:** a capability may be *described as live* only if its `status.json` level is `live`.
  `wired`/`standalone`/`mock` capabilities are policed by `honesty-guard`'s concept map; describing
  one as live/available/shipping fails the build. This is the literal enforcement of the doc-wide
  CURRENT/TARGET honesty rule.

## B. Runtime/account context — the daemon boundary (mostly TARGET in-app)

The Atmosphere pipeline's *runtime* data (chat, captured events, traces, memory, mesh telemetry)
does **not** route through this web repo today, by design:

- **The engine is sovereign and remote.** Substrate (`atmos-core`) + hands (`stratos-agent`) run as a
  daemon on **hardware the user owns** (`~/atmosphere-core`). `/app` is a *remote control plane*, so
  the web surface deliberately does not hold or proxy live agent state — it renders preview/zero
  states (see `ARCHITECTURE.md` and the per-module spec
  `/opt/efficient-labs/context/architecture/theatmosphere-operating-architecture.md`).
- **Auth context** is the one runtime input that does route in: `lib/supabase.ts` →
  `components/os/useOsSession.ts` → `OsSessionProvider` → every module via `useOs()`. Unconfigured
  Supabase ⇒ signed-out preview (never throws).
- **TARGET:** the daemon link that lets `/app` capture/route/display real per-account runtime context
  (transcripts, runs, traces, node figures, approval queue). Until it exists, runtime context lives on
  the user's machine and the in-app pipeline view is specified by each page's zero-states.

---

## Mapping the pipeline onto this repo

| Pipeline stage (`CONTEXT_CAPTURE_SCHEMA.md`) | In this repo | CURRENT / TARGET |
| :-- | :-- | :-- |
| Input | auth (Supabase), capability levels from operator/`ship.mjs`; (runtime input lives on the daemon) | auth + status CURRENT; runtime input is daemon-side |
| Capture | `data/status.json`, `data/updates.json`, `data/docs.ts` | CURRENT (capability/content context) |
| Classify / Route | `lib/status.ts`, `CapStatus`→`capLevel`, `proxy.ts` (host→index policy) | CURRENT |
| Store | `data/*` (committed), Supabase (auth) | CURRENT |
| Execute | `/app` modules render; `ship.mjs` promotes a level | CURRENT for status/site; OS run execution is daemon-side / TARGET |
| Trace | receipts surfaced as badges (`live`) in Skills/Workflows | badge CURRENT; in-app trace view TARGET |
| Evaluate | `honesty-guard.mjs` (build-time correctness gate on claims) | CURRENT (claims); per-task eval is daemon-side / TARGET |
| Compress / Improve | `/updates` changelog + docs queue from `ship.mjs` | CURRENT for the public record; self-improvement loop is daemon-side |

## Mapping `Workspace > Project > Workflow > Task > Subtask`

This web repo is itself **one Project** (the *interface layer*) inside the Atmosphere Workspace. Its
own internal "workflows" are the build/ship pipelines:

- **Project:** `efficientlabs-web` (interface layer / face).
- **Workflows:** `prebuild → honesty-guard → build → deploy` (Vercel); and `ship.mjs status|release`.
- **Tasks:** per-route pages (`app/**/page.tsx`) and per-module OS surfaces (`app/app/*`).
- **The OS itself surfaces this primitive to the user:** `/app/projects` is the **UI of the
  `Workspace>…>Subtask` tree** — TARGET in-app (renders example shapes + `ComingSoon`), backed by the
  folder standard + `stratos icm` scaffold on the daemon side (see substrate doc §4).

## Index / SEO routing (CURRENT)

`proxy.ts` routes by host: apex `efficientlabs.ai`/`www` indexable; all other hosts forced
`X-Robots-Tag: noindex` (fail-closed on missing host); `dashboard.efficientlabs.ai/` → `/ops`.
`/app` and `/dashboard` layouts add per-route `robots: noindex` (private control planes).

---

## Current-vs-Target — one line

**Capability/status context is fully routed and build-time-enforced today** (`data/status.json` →
`lib/status.ts`/`CapStatus`/`/status` out, `ship.mjs` in, `honesty-guard.mjs` as the tripwire);
**runtime/account context** beyond auth is **TARGET in-app** — it lives on the user-owned daemon by
design, and the `/app` modules show honest preview/zero states until the daemon link routes it in.
