/**
 * The Efficient Labs wordmark — brushed-chrome letters with the electric-blue
 * lens-flare streak, matching the logo. Vector/CSS so it stays crisp at any size
 * and the blue accent can glow. Swap to the exact raster by dropping it at
 * /public/logo-source.png (then black-key the background) if pixel-exact is needed.
 */
export default function Wordmark({
  size = 15,
  tracking = "0.2em",
  flare = false,
  className = "",
}: {
  size?: number;
  tracking?: string;
  flare?: boolean;
  className?: string;
}) {
  return (
    <span className={`wordmark ${className}`} aria-label="Efficient Labs" role="img">
      <span className="wm-text" style={{ fontSize: size, letterSpacing: tracking }}>
        Efficient&nbsp;Labs
      </span>
      {flare && <span className="wm-flare" style={{ width: "78%" }} />}
    </span>
  );
}
