import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";

/**
 * PROOF lede — a quiet headline that frames the ProofStrip tiles below it.
 * The differentiator stated plainly: verifiability over vibes. Server-rendered.
 */
export default function ProofLede() {
  return (
    <div className="container-x">
      <div className="max-w-2xl">
        <KickerLabel index="—" text="Proof, not promises" />
        <SplitHeading as="h2" className="t-section mt-6">
          Trust you can verify — not vibes{" "}
          <span className="aurora-text">you&apos;re asked to take on faith</span>.
        </SplitHeading>
      </div>
    </div>
  );
}
