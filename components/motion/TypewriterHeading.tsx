"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motionOK, INTRO_PLAY_EVENT } from "@/lib/motion";

/**
 * Hero title that TYPES itself out, character by character, then rests with a
 * blinking caret that disappears on completion. Styled segments (aurora spans)
 * and line breaks are preserved as the text reveals.
 *
 * Base state = the full, static, server-rendered title (SEO / no-JS / reduced
 * motion). When motion is allowed we reset to empty BEFORE paint (no flash) and
 * type. With the homepage preloader running, typing waits for the intro handoff.
 */
export type TwSeg = { text?: string; accent?: boolean; break?: boolean };

const useIsoLayout = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function TypewriterHeading({
  segments,
  className = "",
  as = "h1",
  speed = 44,
}: {
  segments: TwSeg[];
  className?: string;
  as?: "h1" | "h2";
  speed?: number;
}) {
  const total = segments.reduce(
    (n, s) => n + (s.break ? 0 : (s.text ?? "").length),
    0,
  );
  const label = segments.map((s) => (s.break ? " " : (s.text ?? ""))).join("");

  // SSR + first client render: full text (matches, no hydration mismatch).
  const [count, setCount] = useState(total);
  const [done, setDone] = useState(true);
  const raf = useRef(0);

  // Before paint: if motion is allowed, blank it so we can type with no flash.
  useIsoLayout(() => {
    if (!motionOK()) return;
    setCount(0);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!motionOK()) return;
    const introPending =
      document.documentElement.getAttribute("data-intro") === "pending";
    let cancelled = false;
    let i = 0;
    let last = 0;
    let pause = 0;
    const tick = (t: number) => {
      if (cancelled) return;
      if (!last) last = t;
      if (t - last >= speed + pause) {
        i += 1;
        setCount(i);
        // a beat after sentence punctuation, for cadence
        const ch = label[i - 1];
        pause = ch === "." ? 260 : ch === "," ? 120 : 0;
        last = t;
      }
      if (i < total) raf.current = requestAnimationFrame(tick);
      else setDone(true);
    };
    const start = () => {
      raf.current = requestAnimationFrame(tick);
    };
    if (introPending) {
      window.addEventListener(INTRO_PLAY_EVENT, start, { once: true });
    } else {
      start();
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      window.removeEventListener(INTRO_PLAY_EVENT, start);
    };
  }, [total, speed, label]);

  // Walk segments, emitting typed characters with their styling; the caret
  // sits at the write head. Breaks are always emitted so the second line's
  // height is reserved from the start (no layout shift while typing).
  let remaining = count;
  const out: ReactNode[] = [];
  segments.forEach((s, idx) => {
    if (s.break) {
      out.push(<br key={`br-${idx}`} />);
      return;
    }
    const text = s.text ?? "";
    const shown = Math.max(0, Math.min(text.length, remaining));
    remaining -= text.length;
    if (shown <= 0) return;
    const piece = text.slice(0, shown);
    out.push(
      s.accent ? (
        <span key={idx} className="aurora-text">
          {piece}
        </span>
      ) : (
        <span key={idx}>{piece}</span>
      ),
    );
  });

  const Tag = as;
  return (
    <Tag className={className} aria-label={label}>
      <span aria-hidden>
        {out}
        {!done && <span className="tw-caret">|</span>}
      </span>
    </Tag>
  );
}
