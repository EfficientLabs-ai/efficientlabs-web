"use client";
// §B — the HERO INTERACTION. The visitor's own browser fetches the published
// receipt bundle and replays the proof: full hash chain + BOTH halves of the
// hybrid post-quantum signature (Ed25519 + ML-DSA-65), holding only the node's
// public key. The result shown is THIS run's result — never a stored one. If
// JS can't run the verifier, the card falls back to the CLI path: honesty,
// not a fake checkmark.
//
// "Break it" re-runs the verifier on a copy with ONE field altered and shows
// the live ✗ — fail-closed, demonstrated in one tap.
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReceiptsTile } from "@/lib/public-status";
import type { VerifyResult, ReceiptBundle } from "@/lib/verify-receipts";
import { LabelChip, UpdatedAt, NotMeasuredCard, VERDICT } from "@/components/proof/bits";

type Phase =
  | { s: "fetching" }
  | { s: "verifying" }
  | { s: "done"; r: VerifyResult }
  | { s: "unavailable"; why: string };

const shortDid = (did: string) => (did.length > 28 ? did.slice(0, 22) + "…" + did.slice(-6) : did);

export default function ReceiptVerifyCard({ tile }: { tile: ReceiptsTile }) {
  const [phase, setPhase] = useState<Phase>({ s: "fetching" });
  const [bundle, setBundle] = useState<ReceiptBundle | null>(null);
  const [tamper, setTamper] = useState<VerifyResult | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(tile.bundle_path || "/proof/receipts-bundle.json");
        if (!res.ok) throw new Error(`bundle fetch failed (${res.status})`);
        const b = (await res.json()) as ReceiptBundle;
        if (!alive) return;
        setBundle(b);
        setPhase({ s: "verifying" });
        const { verifyReceiptBundle } = await import("@/lib/verify-receipts");
        const r = verifyReceiptBundle(b);
        if (alive) setPhase({ s: "done", r });
      } catch (e) {
        if (alive) setPhase({ s: "unavailable", why: (e as Error).message });
      }
    })();
    return () => { alive = false; };
  }, [tile.bundle_path]);

  const breakIt = useCallback(async () => {
    if (!bundle) return;
    const { verifyTamperedCopy } = await import("@/lib/verify-receipts");
    setTamper(verifyTamperedCopy(bundle));
  }, [bundle]);

  if (tile.label === null) {
    return <NotMeasuredCard title="signed capability receipts" reason={tile.reason} />;
  }

  return (
    <div className="lm-card p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="kicker">Verified in your browser</p>
        <span className="flex items-center gap-3">
          <UpdatedAt updatedAt={tile.updated_at} />
          <LabelChip label={tile.label} />
        </span>
      </div>

      {/* ── the live state machine ── */}
      <div className="mt-5 min-h-[5.5rem]">
        {phase.s === "fetching" && (
          <p className="mono text-[13px] text-[color:var(--color-ink-faint)]">fetching receipt bundle…</p>
        )}
        {phase.s === "verifying" && (
          <p className="mono text-[13px] text-[color:var(--color-ink-faint)]">
            replaying hash chain · checking Ed25519 + ML-DSA-65…
          </p>
        )}
        {phase.s === "done" && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {phase.r.ok ? (
              <>
                <p className="display text-[clamp(1.4rem,3.5vw,1.9rem)]" style={{ color: VERDICT.GREEN }}>
                  ✓ chain intact
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                  {phase.r.count} receipt{phase.r.count === 1 ? "" : "s"} · every hybrid signature verified just
                  now, in this browser, with the public key only.
                </p>
                {phase.r.derivedDid && (
                  <p className="mono mt-2 text-[11px] text-[color:var(--color-ink-faint)]">
                    node {shortDid(phase.r.derivedDid)} — derived here from the public key
                    {phase.r.didMatches === true && " · matches the bundle's claim"}
                    {phase.r.didMatches === false && " · DOES NOT match the bundle's claim"}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="display text-[clamp(1.4rem,3.5vw,1.9rem)]" style={{ color: VERDICT.RED }}>
                  ✗ bundle broken
                </p>
                <p className="mono mt-1 text-[12px] text-[color:var(--color-ink-faint)]">
                  {phase.r.reason}
                  {phase.r.brokenAt != null && ` (receipt ${phase.r.brokenAt})`} — shown as-is; this page never
                  substitutes a stored result.
                </p>
              </>
            )}
          </motion.div>
        )}
        {phase.s === "unavailable" && (
          <div>
            <p className="mono text-[13px] text-[color:var(--color-ink)]">in-browser verify unavailable ({phase.why})</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
              Verify on your own machine instead — the bundle and CLI are public:
            </p>
            <pre className="mono mt-2 overflow-x-auto rounded-md border border-[color:var(--color-line)] p-2 text-[11px] text-[color:var(--color-ink-dim)]">
              {"npm i -g @efficientlabs/stratos\nstratos receipt verify receipts-bundle.json"}
            </pre>
          </div>
        )}
      </div>

      {/* ── break-it: fail-closed, demonstrated ── */}
      {phase.s === "done" && phase.r.ok && (
        <div className="mt-4 border-t border-[color:var(--color-line)] pt-4">
          {tamper === null ? (
            <button onClick={breakIt} className="btn-outline text-[12px]">
              Break it — alter one field, re-verify
            </button>
          ) : (
            <motion.p
              className="mono text-[12px]"
              style={{ color: VERDICT.RED }}
              initial={reduced ? false : { opacity: 0 }}
              animate={reduced ? undefined : { opacity: 1 }}
            >
              ✗ {tamper.reason}
              {tamper.brokenAt != null && ` (receipt ${tamper.brokenAt})`} — one altered field and the proof
              dies. That&apos;s the point.
            </motion.p>
          )}
        </div>
      )}

      <p className="mono mt-4 border-t border-[color:var(--color-line)] pt-2 text-[10px] leading-relaxed text-[color:var(--color-ink-faint)]">
        verify: <a className="underline decoration-dotted underline-offset-2" href={tile.bundle_path || "/proof/receipts-bundle.json"}>receipts-bundle.json</a>{" "}
        · stratos receipt verify receipts-bundle.json · verifier source is public (StratosAgent repo)
      </p>
    </div>
  );
}
