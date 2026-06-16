"use client";
import CinematicScrub, { type Beat } from "@/components/acts/CinematicScrub";
import { LAYERS, TONE } from "@/lib/architecture-layers";

/* The architecture as the cinematic centrepiece: the descent→orbit "journey"
   film (145 frames) scrubbed across the seven layer beats — the camera motion
   IS the transition between beats. Cinematic-primary, copy on top. */

const BEATS: Beat[] = LAYERS.map((l, i) => ({
  at: (i + 0.5) / LAYERS.length,
  n: l.n,
  name: l.name,
  full: l.full,
  role: l.role,
  status: l.status,
  color: TONE[l.tone].hex,
  blurb: l.blurb,
  cta: l.cta,
}));

export default function ArchitectureFilm() {
  return (
    <CinematicScrub
      dir="/media/cinematic/journey"
      count={145}
      heightVh={(LAYERS.length + 1) * 100}
      eyebrow="The architecture"
      heading={
        <>
          Six products. <span className="aurora-text">One owned environment.</span>
        </>
      }
      beats={BEATS}
    />
  );
}
