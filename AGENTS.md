<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Production Standard — Sovereign UI/UX Engineering System

Build at Awwwards/FWA production tier. Reject generic/boilerplate layouts. Every section is cinematic, performant, and original (Mobbin informs *structure*; we never reproduce another site's code/branding/layout).

## Ground syntax in live docs, not training memory
Before writing nontrivial code for any of these, fetch current docs via the **Context7 MCP** (training is stale; Next 16 + Tailwind v4 especially differ): Three.js + React Three Fiber + drei · GSAP core + ScrollTrigger/SplitText/CustomEase · Framer Motion (the `motion` package) · Tailwind v4 · Next 16. The motion tokens live in `lib/motion.ts` — use them; don't hardcode eases/durations.

## The MCP toolchain (what's wired here)
- **Mobbin MCP** — visual oracle. Calibrate layout/density/whitespace/states against premium references *before* building.
- **Higgsfield MCP** — generative images + video for backdrops/loops. Output → `public/media/`.
- **Remotion** (`remotion/`) — programmatic, parameterized React→`.mp4` for marketing/explainer/infographic video. Catalog in `remotion/Root.tsx`; render `npx remotion render remotion/index.ts <CompId> public/media/<file>.mp4 --browser-executable=/home/neo/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`.
- **HeyGen MCP (HyperFrames / avatars)** — NOT connected in this environment; requires a HeyGen account + MCP connection + key. Until then, use Higgsfield/Remotion for video.
- **Headless-Chromium vision QA** — `node ~/shots/*.mjs` screenshots the running preview; every build is *seen*, never just DOM-verified.

## Architectural mandates (cinematic interaction)
- **Sticky-to-release:** pin a parent over a scroll range (`position:sticky; top:0` or ScrollTrigger pin), drive internal transforms over that range, release to flow.
- **Dual-layer:** fixed WebGL/Canvas background + translucent semantic DOM foreground; pipe the section's scroll progress as a normalized `0→1` float into the renderer.
- **Kinetic friction:** never linear — cubic-bezier (e.g. `0.25,1,0.5,1`) or spring tension for natural inertia.
- **Performance:** bind pointer/interpolation to `requestAnimationFrame` or the GSAP ticker; destroy listeners/contexts/observers in `useEffect` cleanup. Animate **transform/opacity only** (the `motion-guard` prebuild fails layout/filter tweens). Reduced-motion = clean static base.

## Pipeline for any new section/component
1. **Mobbin** — calibrate the pattern. 2. Draft DOM grid + state tree. 3. Map the timeline (entrance → sticky phase → release → exit). 4. Source media (Higgsfield/Remotion). 5. Build to the mandates. 6. **Screenshot-verify** (dark + light + 390px). 7. Founder sign-off on the preview before merge.

## Claim discipline
Copy is claim-disciplined — the `honesty-guard` prebuild fails banned terms ("certified/guaranteed/fully autonomous/compliant") and unsupported metrics. Trust converts here; honesty is the asset. No deploy/merge to production without founder approval.
