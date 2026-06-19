import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * BrandTitle — a parameterized kinetic title card on the brand void + aurora. All movement is
 * transform/opacity (compositor-safe), springs + cubic eases (no linear velocity), and every value
 * is derived from the frame so the render is deterministic. Drive it via props.
 */
export type BrandTitleProps = {
  kicker: string;
  title: string;
  accent: string;
  sub: string;
};

const VOID = "#0b0f1a";
const SIGNAL = "#0a84ff";
const QUANTUM = "#3d6cff";
const INK = "#e8ecf3";
const DIM = "#9aa4b2";

export const BrandTitle: React.FC<BrandTitleProps> = ({ kicker, title, accent, sub }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.7 } });
  const kickerO = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleO = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(enter, [0, 1], [44, 0]);
  const accentO = interpolate(frame, [22, 42], [0, 1], { extrapolateRight: "clamp" });
  const subO = interpolate(frame, [38, 56], [0, 1], { extrapolateRight: "clamp" });
  // slow ambient drift on the aurora + a gentle scale-settle, then a clean fade out
  const drift = Math.sin(frame / 40) * 18;
  const settle = interpolate(enter, [0, 1], [1.04, 1]);
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* aurora blooms */}
      <AbsoluteFill style={{ transform: `translateX(${drift}px) scale(${settle})` }}>
        <div style={{ position: "absolute", left: "16%", top: "22%", width: 760, height: 760, borderRadius: "50%",
          background: `radial-gradient(circle, ${SIGNAL}, transparent 60%)`, opacity: 0.22, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", right: "12%", bottom: "14%", width: 680, height: 680, borderRadius: "50%",
          background: `radial-gradient(circle, ${QUANTUM}, transparent 60%)`, opacity: 0.2, filter: "blur(130px)" }} />
      </AbsoluteFill>

      {/* content */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120, textAlign: "center" }}>
        <div style={{ opacity: kickerO, letterSpacing: 8, fontSize: 26, fontWeight: 600, color: SIGNAL,
          fontFamily: "monospace", textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ opacity: titleO, transform: `translateY(${titleY}px)`, marginTop: 36, fontSize: 132,
          fontWeight: 700, lineHeight: 1.02, color: INK, letterSpacing: -2 }}>{title}</div>
        <div style={{ opacity: accentO, marginTop: 8, fontSize: 132, fontWeight: 700, lineHeight: 1.02,
          letterSpacing: -2, backgroundImage: `linear-gradient(90deg, ${SIGNAL}, ${QUANTUM})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{accent}</div>
        <div style={{ opacity: subO, marginTop: 44, fontSize: 34, color: DIM, maxWidth: 1100 }}>{sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
