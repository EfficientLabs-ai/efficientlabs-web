/**
 * The Efficient Labs orbital mark — core (Intelligence) inside a continuity
 * ring with an orbit path. Pure SVG + CSS so it ships in the server payload.
 *
 * Motion = the brand's Orbital Pulse: every 8s the core pulses, the orbit
 * glows, then everything fades back to rest. The mark NEVER spins
 * continuously (brand system rule). Animations live in globals.css under
 * .orbital-mark and are disabled by the global reduced-motion block.
 */
export default function OrbitalMark({
  size = 22,
  pulse = true,
  className = "",
}: {
  size?: number;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={`orbital-mark ${pulse ? "is-pulsing" : ""} ${className}`}
      aria-hidden
      focusable="false"
    >
      {/* continuity ring */}
      <circle
        className="om-ring"
        cx="24" cy="24" r="20"
        fill="none" stroke="var(--color-silver)" strokeWidth="1.5"
      />
      {/* orbit path — tilted ellipse */}
      <ellipse
        className="om-orbit"
        cx="24" cy="24" rx="20" ry="8.5"
        fill="none" stroke="var(--color-signal)" strokeWidth="1.5"
        transform="rotate(-24 24 24)"
      />
      {/* orbiting node, resting on the path */}
      <circle className="om-node" cx="41.5" cy="15.5" r="2.2" fill="var(--color-quantum)" />
      {/* intelligence core */}
      <circle className="om-core" cx="24" cy="24" r="5" fill="var(--color-signal)" />
    </svg>
  );
}
