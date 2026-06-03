# Demo Video — "How to use The Atmosphere" (motion graphics + mission)

**Goal:** a ~70s explainer that (1) shows how to install + use The Atmosphere & StratosAgent, and
(2) sells the mission — end data sharecropping, put thousands back in users' pockets, a sovereign +
private + compliance-safe network for **everyone**: users, developers, regulated business, government.
**Tone:** confident, plain, a little defiant. Motion-graphic, cinematic, Chrome & Sky.

## Beats
| # | Time | On-screen (visual) | VO |
|---|---|---|---|
| 1 · HOOK | 0–8s | Monolith datacenter siphoning glowing data-threads from people (reuse `mkt-datacenter`); red glow beneath | "Every time your AI does something brilliant… someone else owns the result — and bills you for it." |
| 2 · PROBLEM | 8–18s | Money + data draining into the cloud; counters tick up: *egress fees · metered tokens · shadow-AI risk*; "$4.2M avg breach", "€35M fines" flash | "Rented, metered, surveilled. Your data is the rent. Compliance is the risk. It's costing you thousands a year." |
| 3 · THE TURN | 18–26s | Cloud dissolves → terminal appears; type `curl … \| sh` → `stratos up` (screen-record the site's Install terminal) | "But it doesn't have to live in their cloud. Two commands — and it runs on your own metal." |
| 4 · DEMO / HOW TO USE | 26–48s | Split-screen: StratosAgent answering in a terminal + Telegram (local, fast); motion-graphic overlays of the three moats — **mesh** (no open ports, `hole-punch` viz), **seal** (post-quantum ✓, red tamper rejected), **senses** (eyes/ears/voice icons lighting). Screen-record the site's content-address + skill-seal animations as b-roll. | "Ask it anything. It answers locally — fast, free, private. Meshed peer-to-peer with no open ports. Post-quantum-sealed. It can even see your screen, hear you, and speak — all on your machine." |
| 5 · VALUE | 48–62s | The money-back / data-returned shot (Higgsfield `70a5de20`): value flowing back into people's hands; badges fade in: **Users · Developers · Regulated business · Government** | "Thousands, back in your pocket. Sovereign, private, and compliant by construction — for everyone, from solo developers to governments." |
| 6 · CTA | 62–72s | Earth-from-space + mesh (reuse `mkt-mesh`/`atmosphere`), then EFFICIENT LABS wordmark + `efficientlabs.ai` + "Install now →" | "The cloud was never yours. The sky always was. Build in the open air." |

## Assets
- **Reuse:** `mkt-datacenter`, `mkt-skyreveal`, `mkt-mesh`, `stratos-wave`, `thesis-architecture.mp4`
- **New (Higgsfield):** `70a5de20` (value/data returning to people) — generating; add a "moats" motion-graphic shot if needed
- **Screen-record (b-roll):** the live site — Install terminal, content-addressing demo, skill-seal animation, the hero node-dive, the StratosAgent section. The site already animates the story; capture at 1440p via Playwright video.
- **Audio:** piper neural VO (same `ryan` voice as the brand film) + the synthesized dark-cinematic score, score sidechain-ducked under VO (reuse `~/.cache/piper` + `mix.sh` pipeline).

## Assembly
Same pipeline as `efficient-labs-film-vo.mp4`: ffmpeg xfade between beats, Michroma/JetBrains-Mono
kinetic captions, VO + ducked score, 9:16 vertical cut for Reels/TikTok + a 16:9 master. The site
screen-recordings are the "how to use" proof; the Higgsfield shots carry the mission.
