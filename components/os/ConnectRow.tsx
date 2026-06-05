"use client";
import { createElement, isValidElement, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
/**
 * ConnectRow — one connectable provider / node / key row.
 * Row pattern mirrors CapStatus. State drives the right-hand control:
 *   available → btn-outline "Connect" (onConnect)
 *   connected → green dot + "Connected"
 *   preview   → "Sign in to connect" linking to /login
 * `locked` forces the preview control regardless of state.
 */
export default function ConnectRow({
  icon,
  name,
  detail,
  state,
  onConnect,
  locked,
  cta = "Connect",
}: {
  icon: LucideIcon | ReactNode;
  name: string;
  detail?: string;
  state: "connected" | "available" | "preview";
  onConnect?: () => void;
  locked?: boolean;
  cta?: string;
}) {
  const effective = locked ? "preview" : state;

  // icon may be: a ready-made React element, a Lucide component (a forwardRef
  // object in lucide-react v1 — not a plain function), or any other node.
  const iconNode = isValidElement(icon)
    ? icon
    : icon
      ? createElement(icon as ComponentType<{ size?: number }>, { size: 17 })
      : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[color:var(--color-ink-dim)]">
          {iconNode}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] text-[color:var(--color-ink)]">{name}</p>
          {detail && (
            <p className="mono truncate text-[11px] text-[color:var(--color-ink-faint)]">{detail}</p>
          )}
        </div>
      </div>

      {effective === "connected" && (
        <span className="mono inline-flex shrink-0 items-center gap-1.5 text-[12px] text-[color:var(--color-signal)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--color-signal)",
              animation: "pulse-dot 2.2s ease-in-out infinite",
            }}
          />
          Connected
        </span>
      )}

      {effective === "available" && (
        <button onClick={onConnect} className="btn-outline shrink-0 !px-3.5 !py-1.5 text-[12px]">
          {cta}
        </button>
      )}

      {effective === "preview" && (
        <Link
          href="/login"
          className="mono shrink-0 text-[12px] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-signal)]"
        >
          Sign in to connect
        </Link>
      )}
    </div>
  );
}
