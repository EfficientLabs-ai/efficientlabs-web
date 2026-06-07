"use client";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOsTheme } from "./useOsTheme";
import {
  useOsPrefs,
  ACCENTS,
  DENSITY,
  DASH_SECTIONS,
  type OsAccent,
  type OsDensity,
} from "./useOsPrefs";

/**
 * CustomizePanel — the customization hub UI for the Atmosphere OS.
 *
 * Pure presentation prefs, all client-side + persisted (see useOsPrefs +
 * useOsTheme). Nothing here touches or invents data: it only governs appearance,
 * Home layout, and whether Advanced controls are revealed.
 *
 * Used by /app/settings (full hub) and reusable elsewhere (e.g. a quick panel).
 * Sectioned: Theme · Accent · Density · Dashboard layout · Advanced mode.
 */
export default function CustomizePanel() {
  const { theme, setTheme } = useOsTheme();
  const {
    prefs,
    setAccent,
    setDensity,
    toggleAdvanced,
    setSectionVisible,
    moveSection,
    resetPrefs,
  } = useOsPrefs();

  return (
    <div className="space-y-8">
      {/* Theme */}
      <Group title="Theme" hint="Light or dark for the whole OS. Stored separately, persisted.">
        <div className="flex gap-2">
          <ChoiceButton active={theme === "light"} onClick={() => setTheme("light")}>
            <Sun size={14} /> Light
          </ChoiceButton>
          <ChoiceButton active={theme === "dark"} onClick={() => setTheme("dark")}>
            <Moon size={14} /> Dark
          </ChoiceButton>
        </div>
      </Group>

      {/* Accent */}
      <Group
        title="Accent"
        hint="Tints buttons, links, status dots, and active states across the OS."
      >
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(ACCENTS) as OsAccent[]).map((key) => {
            const a = ACCENTS[key];
            const active = prefs.accent === key;
            return (
              <button
                key={key}
                onClick={() => setAccent(key)}
                aria-pressed={active}
                className={cn(
                  "group flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "border-[color:var(--color-signal)] text-[color:var(--color-ink)]"
                    : "border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]",
                )}
              >
                <span
                  aria-hidden
                  className="grid h-4 w-4 place-items-center rounded-full"
                  style={{ background: a.signal }}
                >
                  {active && <Check size={11} color="#fff" strokeWidth={3} />}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </Group>

      {/* Density */}
      <Group title="Density" hint="Comfortable spacing or a tighter, compact layout.">
        <div className="flex gap-2">
          {(Object.keys(DENSITY) as OsDensity[]).map((key) => (
            <ChoiceButton
              key={key}
              active={prefs.density === key}
              onClick={() => setDensity(key)}
            >
              {DENSITY[key].label}
            </ChoiceButton>
          ))}
        </div>
      </Group>

      {/* Dashboard layout */}
      <Group
        title="Dashboard layout"
        hint="Show, hide, and reorder the sections on your Home overview. Persisted."
      >
        <div className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]">
          {DASH_SECTIONS.map((s, idx) => {
            const shown = prefs.dashOrder.includes(s.id);
            const orderIndex = prefs.dashOrder.indexOf(s.id);
            const isFirst = orderIndex === 0;
            const isLast = orderIndex === prefs.dashOrder.length - 1;
            const isAdvancedPanel = s.id === "advanced";
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 bg-[color:var(--color-void-2)] px-3.5 py-3",
                  idx > 0 && "border-t border-[color:var(--color-line)]",
                  !shown && "opacity-55",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[color:var(--color-ink)]">
                    {s.label}
                    {isAdvancedPanel && (
                      <span className="mono ml-2 text-[10px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                        needs Advanced mode
                      </span>
                    )}
                  </p>
                  <p className="mono truncate text-[11px] text-[color:var(--color-ink-faint)]">
                    {s.description}
                  </p>
                </div>

                {/* reorder — only meaningful when shown */}
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn
                    disabled={!shown || isFirst}
                    label={`Move ${s.label} up`}
                    onClick={() => moveSection(s.id, "up")}
                  >
                    <ChevronUp size={15} />
                  </IconBtn>
                  <IconBtn
                    disabled={!shown || isLast}
                    label={`Move ${s.label} down`}
                    onClick={() => moveSection(s.id, "down")}
                  >
                    <ChevronDown size={15} />
                  </IconBtn>
                  <IconBtn
                    label={shown ? `Hide ${s.label}` : `Show ${s.label}`}
                    onClick={() => setSectionVisible(s.id, !shown)}
                  >
                    {shown ? <Eye size={15} /> : <EyeOff size={15} />}
                  </IconBtn>
                </div>
              </div>
            );
          })}
        </div>
      </Group>

      {/* Advanced mode */}
      <Group
        title="Advanced mode"
        hint="Reveals deeper controls across the OS — agent config, mesh detail, skill management, model routing. Honest: each control is marked Preview / Coming soon where the backend isn't wired, and real where it is."
      >
        <button
          onClick={toggleAdvanced}
          aria-pressed={prefs.advanced}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-[var(--radius)] border px-4 py-3 text-left transition-colors",
            prefs.advanced
              ? "border-[color:var(--color-signal)]/40 bg-[color:var(--color-signal)]/[0.06]"
              : "border-[color:var(--color-line)] bg-[color:var(--color-void-2)]",
          )}
        >
          <span className="flex items-center gap-3">
            <SlidersHorizontal size={16} className="text-[color:var(--color-signal)]" />
            <span>
              <span className="block text-[13.5px] font-medium text-[color:var(--color-ink)]">
                {prefs.advanced ? "Advanced mode on" : "Advanced mode off"}
              </span>
              <span className="mono block text-[11px] text-[color:var(--color-ink-faint)]">
                {prefs.advanced ? "Deeper controls revealed" : "Standard controls only"}
              </span>
            </span>
          </span>
          <Switch on={prefs.advanced} />
        </button>
      </Group>

      {/* Reset */}
      <div className="border-t border-[color:var(--color-line)] pt-5">
        <button
          onClick={resetPrefs}
          className="mono inline-flex items-center gap-1.5 text-[12px] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-ink)]"
        >
          <RotateCcw size={13} /> Reset customization to defaults
        </button>
      </div>
    </div>
  );
}

// ── primitives ────────────────────────────────────────────────────────────────
function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[14px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
        {hint && (
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
            {hint}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-3.5 py-2 text-[13px] transition-colors",
        active
          ? "border-[color:var(--color-signal)] bg-[color:var(--color-signal)]/[0.08] text-[color:var(--color-ink)]"
          : "border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]",
      )}
    >
      {children}
    </button>
  );
}

function IconBtn({
  disabled,
  label,
  onClick,
  children,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-line)] transition-colors",
        disabled
          ? "cursor-not-allowed text-[color:var(--color-ink-faint)] opacity-40"
          : "text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-signal)]/30 hover:text-[color:var(--color-ink)]",
      )}
    >
      {children}
    </button>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-[color:var(--color-signal)]" : "bg-[color:var(--color-line)]",
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
          on ? "translate-x-[1.15rem]" : "translate-x-[0.15rem]",
        )}
      />
    </span>
  );
}
