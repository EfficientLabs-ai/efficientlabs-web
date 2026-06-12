/**
 * The Efficient Labs orbital mark — brand kit v2 geometry: the continuity
 * ring carrying two crossed orbital bands whose intersection holds the
 * four-point intelligence star. Pure SVG + CSS so it ships in the server
 * payload. (Construction per the kit v2 logo sheet: circle + crossed
 * orbits + four-point star + node accent.)
 *
 * Motion = the brand's Orbital Pulse: every 8s the core pulses, the orbits
 * glow, then everything fades back to rest. The mark NEVER spins
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
      {/* crossed orbital bands — the kit v2 sphere */}
      <ellipse
        className="om-orbit"
        cx="24" cy="24" rx="19" ry="9.5"
        fill="none" stroke="var(--color-silver)" strokeWidth="1.5"
        transform="rotate(45 24 24)"
      />
      <ellipse
        className="om-orbit"
        cx="24" cy="24" rx="19" ry="9.5"
        fill="none" stroke="var(--color-signal)" strokeWidth="1.5"
        transform="rotate(-45 24 24)"
      />
      {/* four-point intelligence star at the intersection */}
      <path
        className="om-core"
        d="M24 15.2 C25.7 20.4 27.6 22.3 32.8 24 C27.6 25.7 25.7 27.6 24 32.8 C22.3 27.6 20.4 25.7 15.2 24 C20.4 22.3 22.3 20.4 24 15.2 Z"
        fill="var(--color-signal)"
      />
      {/* orbiting node accent, resting on the ring */}
      <circle className="om-node" cx="38.1" cy="9.9" r="2.1" fill="var(--color-quantum)" />
    </svg>
  );
}
