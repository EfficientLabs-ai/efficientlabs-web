"use client";
import { ActHeader, Reveal } from "@/components/Reveal";

function Row({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-relaxed">
      <span className={`mono mt-px ${ok ? "text-[color:var(--color-signal)]" : "text-[#e0566a]"}`}>
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "text-[color:var(--color-ink-dim)]" : "text-[color:var(--color-ink-faint)]"}>{children}</span>
    </li>
  );
}

export default function Capability() {
  return (
    <div>
      <ActHeader index="03" kicker="Object-capability security" title={<>A <span className="aurora-text">capability</span>, not a secret.</>}>
        Bearer secrets are ambient authority — anyone holding the string can do everything,
        forever. The Atmosphere passes capabilities instead: unforgeable, narrowly-scoped,
        attenuable tokens that grant exactly one verb on exactly one resource, and nothing
        more. The broker can hand a child a key to one door without giving it the building.
      </ActHeader>

      <div className="mt-12 grid gap-5 [&>*]:min-w-0 md:grid-cols-2">
        <Reveal delay={0.05}>
          <div className="h-full rounded-2xl border border-[#3a2030] bg-[#140c10]/60 p-6">
            <div className="flex items-center justify-between">
              <span className="mono text-[12px] text-[#e0566a]">bearer secret</span>
              <span className="mono rounded-full border border-[#3a2030] px-2 py-0.5 text-[10px] text-[#e0566a]">ambient</span>
            </div>
            <code className="mono mt-4 block truncate rounded-md bg-black/40 px-3 py-2 text-[12px] text-[#c98a96]">
              sk_live_51Hh…全权限
            </code>
            <ul className="mt-5 space-y-2.5">
              <Row ok={false}>Grants everything the account can do</Row>
              <Row ok={false}>Long-lived; revoked only by rotation</Row>
              <Row ok={false}>Replayable the moment it leaks</Row>
              <Row ok={false}>Inherited wholesale by every child process</Row>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="h-full rounded-2xl border border-[color:var(--color-signal-deep)]/40 bg-[color:var(--color-signal)]/[0.04] p-6 shadow-[0_0_60px_-20px_var(--color-signal)]">
            <div className="flex items-center justify-between">
              <span className="mono text-[12px] text-[color:var(--color-signal)]">capability token</span>
              <span className="mono rounded-full border border-[color:var(--color-signal-deep)]/50 px-2 py-0.5 text-[10px] text-[color:var(--color-signal)]">scoped</span>
            </div>
            <code className="mono mt-4 block truncate rounded-md bg-black/40 px-3 py-2 text-[12px] text-[color:var(--color-signal)]">
              cap:invoke(audit.classify)·1×·exp+30s
            </code>
            <ul className="mt-5 space-y-2.5">
              <Row ok>One verb, one resource, one use</Row>
              <Row ok>Expires in seconds; attenuable downward</Row>
              <Row ok>Unforgeable — minted, never guessed</Row>
              <Row ok>A child gets one door, never the building</Row>
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
