import Aurora from "@/components/glass/Aurora";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";

/**
 * THE STAKES — names the reader's real fear (autonomy outrunning control)
 * before any product is mentioned. Scroll-reveal lines over a calm aurora.
 * Copy is server-rendered (no-JS / reduced-motion read the static text).
 */
export default function Stakes() {
  return (
    <section id="stakes" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="left" />
      <div className="container-x relative">
        <div className="max-w-3xl">
          <KickerLabel index="01" text="The AI exponential" />
          <SplitHeading as="h2" className="t-section mt-6">
            Capability is outrunning the institutions{" "}
            <span className="aurora-text">meant to govern it</span>.
          </SplitHeading>
          <Reveal delay={0.16}>
            <p className="t-body-lg mt-7 max-w-2xl text-[color:var(--color-ink-dim)]">
              Agents are starting to act — to spend, decide, and move on their own. The moment
              an AI acts, the question stops being{" "}
              <span className="text-[color:var(--color-ink)]">&ldquo;is it smart?&rdquo;</span> and
              becomes{" "}
              <span className="text-[color:var(--color-ink)]">
                &ldquo;who authorized this, what did it touch, and can you prove it?&rdquo;
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
