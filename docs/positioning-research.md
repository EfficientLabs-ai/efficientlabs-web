# Positioning & pricing research (Gemini, 2026-06-03)

Backing research for The Atmosphere's go-to-market. Four buyer segments, the pricing
framework, and the objection handling. Source: Gemini deep-research brief.

## Segment angles (use as the audience-specific headlines)
| Segment | Sharpest angle | Buying trigger | WTP |
|---|---|---|---|
| **Enterprise** | "Air-gapped AI: your data, your IP, your metal." | Failing SOC2/GDPR; CISO blocks cloud-AI on IP-leak fears; API bill spikes; EU AI Act | High — annual contracts, fleet licensing, SLA |
| **SMB / startup** | "Infinite tokens, flat-rate OPEX. Scale AI on hardware you already own." | Token costs destroying gross margin; API rate limits | Med-High — trade metered for flat |
| **Developers** | "Unmetered, zero-latency agentic OS on your localhost." | Cloud latency; offline work; root control over context | Med — already pay $10-25/mo (Copilot/Plus/Pro) |
| **Prosumers** | "Your personal AI, completely off the grid." | Privacy scandals; want a private "second brain" | Low-Med — consumer sub or lifetime |

## Pricing framework — "Sovereign Mesh" (node-count gated, never metered)
- **Free / Community** — 1–2 nodes (laptop + phone), local models, no mesh clustering. Top-of-funnel wedge.
- **Pro ($15–25/mo)** — up to 5 nodes, P2P meshing (pool compute/RAM across your devices), curated optimized weights, local RAG.
- **Team ($49/seat/mo)** — multi-user mesh orchestration, shared context/RAG across team hardware, RBAC.
- **Enterprise ($10k+/yr)** — fleet deployment via MDM, compliance reporting + audit logs, 24/7, managed Sovereign RAG, fine-tuning pipelines.

**Key insight:** gate on **number of meshed nodes**, not usage. Stays true to "no meter," and the
mesh (pooling idle devices) is itself the upsell.

## Top objections → rebuttals (for FAQ / sales)
1. *"Local hardware can't run good models."* → 2026 quantization/MoE + NPUs make 8–15B punch up; the mesh pools RAM/compute across idle devices for bigger models.
2. *"Local infra is a DevOps nightmare."* → single self-updating binary, silent daemon, zero-config networking (Tailscale-for-AI-compute).
3. *"No expertise to maintain models."* → we handle the pipeline: automated curation, updates, hot-swap. You pay for the engine, not maintenance.
4. *"It'll drain laptop battery."* → throttles by load/power state; routes heavy tasks to plugged-in idle devices on the mesh.
5. *"Doesn't P2P open security holes?"* → E2E-encrypted, ephemeral identity tokens (zero-trust); routes over existing VPN/subnet, no firewall holes.

## Applied to the build
- Pricing page reflects node-count tiers (Free 2 / Pro 5 / Team unlimited-team / Enterprise fleet).
- Objections → a future FAQ section.
- Segment angles → audience-specific copy / paid-ad variants / the hero typewriter ordering.
