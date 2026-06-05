"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOsSession, OsSessionProvider } from "./useOsSession";
import OsSidebar from "./OsSidebar";
import OsTopBar from "./OsTopBar";
import OsMobileDrawer from "./OsMobileDrawer";

/**
 * OsShell — the Atmosphere OS frame. Owns auth (via useOsSession) + the mobile
 * drawer state, and renders sidebar + topbar + content. Signed-out users still
 * see the whole OS (preview), with an honest banner above the content and a
 * dimmed content wrapper. Modules read locked={!signedIn} from context props
 * they pass themselves; the shell does not block interaction (all CTAs route
 * to /login when locked).
 *
 * Children may be a render-prop receiving the session, or plain nodes.
 */
export default function OsShell({
  children,
}: {
  children: ReactNode | ((session: ReturnType<typeof useOsSession>) => ReactNode);
}) {
  const session = useOsSession();
  const { email, signedIn, ready } = session;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showPreviewBanner = ready && !signedIn;

  return (
    <OsSessionProvider value={session}>
    <div className="flex min-h-screen">
      {/* persistent sidebar — desktop only */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/40 lg:flex lg:flex-col">
        <OsSidebar email={email} />
      </aside>

      {/* mobile slide-in drawer */}
      <OsMobileDrawer open={drawerOpen} email={email} onClose={() => setDrawerOpen(false)} />

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <OsTopBar email={email} signedIn={signedIn} onOpenDrawer={() => setDrawerOpen(true)} />

        {showPreviewBanner && (
          <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/40 px-4 py-3 sm:px-6">
            <div className="glass flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] px-4 py-3">
              <Sparkles size={16} className="text-[color:var(--color-signal)]" />
              <p className="text-[13px] text-[color:var(--color-ink-dim)]">
                Preview — sign in to connect your agent, nodes, and keys.
              </p>
              <Link href="/login" className="btn-signal ml-auto !px-4 !py-2 text-[12px]">
                Sign in
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}

        <main
          className={cn(
            "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8",
            showPreviewBanner && "opacity-70",
          )}
        >
          {typeof children === "function" ? children(session) : children}
        </main>
      </div>
    </div>
    </OsSessionProvider>
  );
}
