import OrbitalMark from "@/components/OrbitalMark";

/**
 * The Efficient Labs lockup — the kit v2 orbital mark beside the
 * brushed-chrome wordmark (horizontal lockup per the brand sheet).
 * Vector/CSS so it stays crisp at any size and the blue accent can glow.
 * `mark={false}` yields the bare wordmark for surfaces that compose their
 * own lockup (e.g. the footer's stacked variant).
 */
export default function Wordmark({
  size = 15,
  tracking = "0.2em",
  flare = false,
  mark = true,
  pulse = false,
  className = "",
}: {
  size?: number;
  tracking?: string;
  flare?: boolean;
  mark?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  if (!mark) {
    return (
      <span className={`wordmark ${className}`} aria-label="Efficient Labs" role="img">
        <span className="wm-text" style={{ fontSize: size, letterSpacing: tracking }}>
          Efficient&nbsp;Labs
        </span>
        {flare && <span className="wm-flare" style={{ width: "78%" }} />}
      </span>
    );
  }
  return (
    <span
      className={`wm-lockup ${className}`}
      style={{ gap: Math.round(size * 0.55) }}
      aria-label="Efficient Labs"
      role="img"
    >
      <OrbitalMark size={Math.round(size * 1.45)} pulse={pulse} />
      <span className="wordmark">
        <span className="wm-text" style={{ fontSize: size, letterSpacing: tracking }}>
          Efficient&nbsp;Labs
        </span>
        {flare && <span className="wm-flare" style={{ width: "78%" }} />}
      </span>
    </span>
  );
}
