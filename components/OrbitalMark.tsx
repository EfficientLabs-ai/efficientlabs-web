/**
 * The Efficient Labs orbital mark — the real glassy brand render
 * (public/brand/logo-mark.png, background knocked out via luminance→alpha).
 * Same API as before (size · pulse · className) so every call site — nav,
 * footer, app chrome, auth — picks up the exact brand mark automatically.
 *
 * Motion = the brand's Orbital Pulse (a gentle breathing glow every 8s, never
 * a continuous spin), applied via .orbital-mark-img in globals.css and disabled
 * under the global reduced-motion block.
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`orbital-mark-img ${pulse ? "is-pulsing" : ""} ${className}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
