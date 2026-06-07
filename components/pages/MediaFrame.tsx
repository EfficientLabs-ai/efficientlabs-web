"use client";
import { useReducedMotion } from "motion/react";

/**
 * Shared media surface for the standalone sub-pages. Renders an autoplay /
 * muted / looped background video by default, and degrades to a static poster
 * image when the visitor prefers reduced motion (or when only an image is
 * supplied). Aspect ratio is reserved up-front so the page never reflows when
 * the media loads, and the frame clips to the site radius so nothing bleeds.
 *
 * Additive only — pages opt in by passing a `media` prop; existing layouts that
 * don't pass one are completely unchanged.
 */
export type Media = {
  /** Video source under /public, e.g. "/video/mkt-mesh.mp4". Optional: image-only frames skip it. */
  video?: string;
  /** Poster / reduced-motion fallback image under /public, e.g. "/img/thesis-architecture.png". */
  poster: string;
  /** Accessible description of what the media shows. */
  alt: string;
  /** Tailwind aspect class. Defaults to a cinematic 16/9. */
  aspect?: string;
  /** Extra classes on the outer frame (e.g. opacity, rounding overrides). */
  className?: string;
  /** Optional gradient/scrim overlay for text legibility when used as a backdrop. */
  overlay?: boolean;
};

export default function MediaFrame({
  video,
  poster,
  alt,
  aspect = "aspect-video",
  className = "",
  overlay = false,
}: Media) {
  const reduced = useReducedMotion();
  const showVideo = Boolean(video) && !reduced;

  return (
    <div className={`relative w-full overflow-hidden ${aspect} ${className}`}>
      {showVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={poster}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      )}
      {overlay && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,9,12,0.18) 0%, rgba(8,9,12,0.45) 60%, rgba(8,9,12,0.78) 100%)",
          }}
        />
      )}
    </div>
  );
}
