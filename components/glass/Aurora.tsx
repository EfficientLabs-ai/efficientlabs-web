/**
 * Aurora — a soft field of blurred radial light pools placed BEHIND a glass
 * grid so the frosted material has vivid colour to refract (on flat near-black,
 * glass is invisible). Pure CSS, server-rendered, pointer-events-none. Honors
 * the global reduced-motion rule via the .aurora-field tokens in globals.css;
 * nothing here animates JS-side, so it is a static base under reduced-motion.
 *
 * Variants tune the placement so each section's light reads a little different
 * (the eye never sees the exact same bloom twice down the page).
 */
type Variant = "balanced" | "left" | "right" | "center" | "wide";

const LAYOUTS: Record<Variant, { cls: string; style: React.CSSProperties }[]> = {
  balanced: [
    { cls: "glow glow-azure", style: { left: "-8%", top: "8%", width: "34rem", height: "34rem" } },
    { cls: "glow glow-cyan", style: { right: "-6%", top: "28%", width: "30rem", height: "30rem" } },
    { cls: "glow glow-violet", style: { left: "32%", bottom: "-12%", width: "32rem", height: "32rem" } },
  ],
  left: [
    { cls: "glow glow-azure", style: { left: "-12%", top: "12%", width: "38rem", height: "38rem" } },
    { cls: "glow glow-violet", style: { left: "18%", bottom: "-10%", width: "28rem", height: "28rem" } },
  ],
  right: [
    { cls: "glow glow-cyan", style: { right: "-12%", top: "10%", width: "38rem", height: "38rem" } },
    { cls: "glow glow-azure", style: { right: "22%", bottom: "-12%", width: "30rem", height: "30rem" } },
  ],
  center: [
    { cls: "glow glow-azure", style: { left: "50%", top: "50%", width: "40rem", height: "40rem", transform: "translate(-50%, -50%)" } },
    { cls: "glow glow-violet", style: { left: "20%", top: "10%", width: "26rem", height: "26rem" } },
    { cls: "glow glow-cyan", style: { right: "16%", bottom: "-8%", width: "26rem", height: "26rem" } },
  ],
  wide: [
    { cls: "glow glow-azure", style: { left: "2%", top: "-6%", width: "34rem", height: "34rem" } },
    { cls: "glow glow-cyan", style: { left: "38%", top: "30%", width: "30rem", height: "30rem" } },
    { cls: "glow glow-violet", style: { right: "2%", top: "-2%", width: "32rem", height: "32rem" } },
  ],
};

export default function Aurora({
  variant = "balanced",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div aria-hidden className={`aurora-field ${className}`}>
      {LAYOUTS[variant].map((g, i) => (
        <span key={i} className={g.cls} style={g.style} />
      ))}
    </div>
  );
}
