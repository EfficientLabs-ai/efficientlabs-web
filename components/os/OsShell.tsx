"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOsSession, OsSessionProvider } from "./useOsSession";
import { useOsThemeState, OsThemeProvider } from "./useOsTheme";
import OsSidebar from "./OsSidebar";
import OsTopBar from "./OsTopBar";
import OsMobileDrawer from "./OsMobileDrawer";

/**
 * OsShell — the Atmosphere OS frame. Owns auth (via useOsSession), the OS theme
 * (light-first, via useOsThemeState), and the mobile drawer state, and renders
 * sidebar + topbar + content.
 *
 * THEME: this root <div> carries data-theme (default "light"). The light palette
 * lives in app/globals.css as an additive [data-theme="light"] block over the
 * dark defaults, so the scope is exactly the OS subtree — the marketing site,
 * which never sets data-theme, stays dark. A tiny inline script applies the
 * stored choice before paint to avoid a flash when the user has picked dark.
 *
 * Signed-out users still see the whole OS (preview), with an honest banner above
 * the content and a dimmed content wrapper. Modules read locked={!signedIn} from
 * context props they pass themselves; the shell does not block interaction (all
 * CTAs route to /login when locked).
 *
 * Children may be a render-prop receiving the session, or plain nodes.
 */
export default function OsShell({
  children,
}: {
  children: ReactNode | ((session: ReturnType<typeof useOsSession>) => ReactNode);
}) {
  const session = useOsSession();
  const theme = useOsThemeState();
  const { email, signedIn, ready } = session;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showPreviewBanner = ready && !signedIn;

  return (
    <OsSessionProvider value={session}>
      <OsThemeProvider value={theme}>
        {/* Pre-paint: honour the stored choice before React reconciles so a
            dark-mode user never sees a light flash. Default stays light. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('os-theme');var r=document.getElementById('os-root');if(r)r.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();",
          }}
        />
        <div id="os-root" data-theme={theme.theme} className="os-root flex min-h-screen">
          {/* persistent sidebar — desktop only */}
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-[color:var(--color-line)] bg-[color:var(--color-void-2)] lg:flex lg:flex-col">
            <OsSidebar email={email} signedIn={signedIn} />
          </aside>

          {/* mobile slide-in drawer */}
          <OsMobileDrawer
            open={drawerOpen}
            email={email}
            signedIn={signedIn}
            onClose={() => setDrawerOpen(false)}
          />

          {/* main column */}
          <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-[color:var(--color-void)]">
            <OsTopBar email={email} signedIn={signedIn} onOpenDrawer={() => setDrawerOpen(true)} />

            {showPreviewBanner && (
              <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-void-2)] px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/20 bg-[color:var(--color-signal)]/[0.06] px-4 py-3">
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
                showPreviewBanner && "opacity-80",
              )}
            >
              {typeof children === "function" ? children(session) : children}
            </main>
          </div>
        </div>
      </OsThemeProvider>
    </OsSessionProvider>
  );
}
