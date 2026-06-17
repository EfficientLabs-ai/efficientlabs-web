"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { planMeets } from "@/lib/plans";
import { requiredPlanForPath, moduleForPath } from "./modules";
import { PlanWall } from "./PlanGate";
import { useOsSession, OsSessionProvider } from "./useOsSession";
import { useOsThemeState, OsThemeProvider } from "./useOsTheme";
import { useOsPrefsState, OsPrefsProvider, prefsStyle } from "./useOsPrefs";
import OsSidebar from "./OsSidebar";
import OsTopBar from "./OsTopBar";
import OsMobileDrawer from "./OsMobileDrawer";

/**
 * OsShell — the Atmosphere OS frame. Owns auth (via useOsSession), the OS theme
 * (dark-first, via useOsThemeState), and the mobile drawer state, and renders
 * sidebar + topbar + content.
 *
 * THEME: this root <div> carries data-theme (default "dark"). The light palette
 * lives in app/globals.css as an additive [data-theme="light"] block over the
 * dark defaults, so the scope is exactly the OS subtree. A tiny inline script
 * applies the stored choice before paint to avoid a flash when the user has
 * picked light.
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
  const prefs = useOsPrefsState();
  const { email, signedIn, ready, plan } = session;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const showPreviewBanner = ready && !signedIn;
  // module-level plan gate: lock the active route's content for a signed-in user
  // whose plan is below what the module requires (signed-out users see preview).
  const requiredPlan = requiredPlanForPath(pathname);
  const moduleLocked = Boolean(requiredPlan && ready && signedIn && !planMeets(plan, requiredPlan));

  return (
    <OsSessionProvider value={session}>
      <OsThemeProvider value={theme}>
        <OsPrefsProvider value={prefs}>
        {/* Pre-paint: honour the stored theme AND customization prefs before
            React reconciles, so a light-mode / custom-accent user never sees a
            default-styled flash. Theme default stays dark; accent default azure
            is byte-identical to the shipped tokens, so an un-customized OS is
            untouched. Only overrides accent + density tokens scoped to #os-root —
            never anything in globals.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var r=document.getElementById('os-root');if(!r)return;" +
              "var t=localStorage.getItem('os-theme');r.setAttribute('data-theme',t==='light'?'light':'dark');" +
              "var ACC={azure:['#0a84ff','#0868cc'],cyan:['#22b8d6','#0e93b0'],violet:['#7c6cff','#5a47e6']};" +
              "var DEN={comfortable:['8px','6px','10px','1'],compact:['6px','5px','8px','0.92']};" +
              "var p=JSON.parse(localStorage.getItem('os-prefs')||'{}');" +
              "var a=ACC[p.accent]||ACC.azure;var d=DEN[p.density]||DEN.comfortable;" +
              "r.style.setProperty('--color-signal',a[0]);r.style.setProperty('--color-signal-deep',a[1]);" +
              "r.style.setProperty('--radius',d[0]);r.style.setProperty('--radius-sm',d[1]);" +
              "r.style.setProperty('--radius-lg',d[2]);r.style.setProperty('--os-scale',d[3]);" +
              "}catch(e){}})();",
          }}
        />
        <div
          id="os-root"
          data-theme={theme.theme}
          style={prefsStyle(prefs.prefs)}
          className="os-root flex min-h-screen"
        >
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
              {moduleLocked && requiredPlan ? (
                <PlanWall required={requiredPlan} module={moduleForPath(pathname)?.label} />
              ) : typeof children === "function" ? (
                children(session)
              ) : (
                children
              )}
            </main>
          </div>
        </div>
        </OsPrefsProvider>
      </OsThemeProvider>
    </OsSessionProvider>
  );
}
