"use client";
// "…or drop the bundle on the web verifier" — the onboarding checklist's step-5
// promise, now real (ATMOS_ONBOARDING_BACKEND §TO-BUILD: pure FE reuse, zero
// new backend). The visitor's OWN exported bundle is read locally and replayed
// through the same engine the published-bundle card uses: full hash chain +
// both hybrid signature halves, public key only. The file NEVER leaves the
// browser — there is no upload, no request, no storage.
import { useCallback, useRef, useState } from "react";
import type { VerifyResult } from "@/lib/verify-receipts";
import { VERDICT } from "@/components/proof/bits";

type State =
  | { s: "idle" }
  | { s: "verifying"; name: string }
  | { s: "done"; name: string; r: VerifyResult }
  | { s: "invalid"; name: string; why: string };

export default function DropBundleVerify() {
  const [state, setState] = useState<State>({ s: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const verifyFile = useCallback(async (file: File) => {
    setState({ s: "verifying", name: file.name });
    try {
      const text = await file.text();
      let bundle: unknown;
      try { bundle = JSON.parse(text); } catch { throw new Error("not JSON — export with: stratos receipt export <receipts.jsonl> --out bundle.json"); }
      const { verifyReceiptBundle } = await import("@/lib/verify-receipts");
      const r = verifyReceiptBundle(bundle as Parameters<typeof verifyReceiptBundle>[0]);
      setState({ s: "done", name: file.name, r });
    } catch (e) {
      setState({ s: "invalid", name: file.name, why: (e as Error).message });
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) verifyFile(f);
  }, [verifyFile]);

  return (
    <div className="lm-card p-6">
      <p className="kicker">Verify your own bundle</p>
      <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
        Step 5 of the checklist, in the browser: drop the <span className="mono text-[12px]">bundle.json</span>{" "}
        your node exported and the same verifier runs on it — your file is read locally and{" "}
        <strong className="text-[color:var(--color-ink)]">never leaves this page</strong>. No upload, no account.
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-label="Drop a receipt bundle file here, or press Enter to choose one"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={
          "mt-4 cursor-pointer rounded-[var(--radius-sm)] border border-dashed px-4 py-6 text-center transition-colors " +
          (dragOver
            ? "border-[color:var(--color-signal)] bg-[color:var(--color-void-2)]/60"
            : "border-[color:var(--color-line)] hover:border-[color:var(--color-ink-faint)]")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) verifyFile(f); e.target.value = ""; }}
        />
        <p className="mono text-[12px] text-[color:var(--color-ink-dim)]">
          {state.s === "verifying" ? `replaying ${state.name}…` : "drop bundle.json here — or click to choose"}
        </p>
      </div>

      <div className="mt-3 min-h-[3.2rem]" aria-live="polite">
        {state.s === "done" && state.r.ok && (
          <>
            <p className="mono text-[14px] font-semibold" style={{ color: VERDICT.GREEN }}>
              ✓ {state.name}: chain intact — {state.r.count} receipt{state.r.count === 1 ? "" : "s"}
            </p>
            <p className="mono mt-1 text-[11px] text-[color:var(--color-ink-faint)]">
              every hybrid signature (Ed25519 + ML-DSA-65) verified just now with the bundle&apos;s public key
              {state.r.derivedDid && <> · node {state.r.derivedDid.slice(0, 22)}…</>}
            </p>
          </>
        )}
        {state.s === "done" && !state.r.ok && (
          <p className="mono text-[12px]" style={{ color: VERDICT.RED }}>
            ✗ {state.name}: {state.r.reason}
            {state.r.brokenAt != null && ` (receipt ${state.r.brokenAt})`} — shown as-is, fail-closed.
          </p>
        )}
        {state.s === "invalid" && (
          <p className="mono text-[12px] text-[color:var(--color-ink-faint)]">
            {state.name}: {state.why}
          </p>
        )}
      </div>

      <p className="mono mt-2 border-t border-[color:var(--color-line)] pt-2 text-[10px] leading-relaxed text-[color:var(--color-ink-faint)]">
        same check offline: stratos receipt verify bundle.json · the verifier source is public (StratosAgent repo)
      </p>
    </div>
  );
}
