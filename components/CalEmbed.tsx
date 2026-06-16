"use client";

/**
 * Cal.com inline scheduler. The booking handle is read from
 * NEXT_PUBLIC_CALCOM_LINK (e.g. "efficientlabs/enterprise") so it's swappable
 * without a code change and nothing private is hardcoded. Until that env var is
 * set in the deployment, it falls back to a placeholder handle — set the real
 * one and create the matching Cal.com event type to make this live.
 */
const CAL = process.env.NEXT_PUBLIC_CALCOM_LINK || "efficientlabs/enterprise";

export default function CalEmbed() {
  return (
    <div className="lm-card overflow-hidden p-1.5">
      <iframe
        title="Schedule a conversation with Efficient Labs"
        src={`https://cal.com/${CAL}?embed=true&theme=dark&layout=month_view`}
        className="h-[700px] w-full rounded-[var(--radius)] border-0"
        loading="lazy"
      />
    </div>
  );
}
