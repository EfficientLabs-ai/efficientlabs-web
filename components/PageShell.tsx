import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Shared shell for the standalone (non-landing) pages.
 *
 * Renders the fixed <Nav/>, adds top padding so content clears the fixed
 * header, then <Footer/>. By default the children are constrained to the
 * site's `.container-x` (max-width + horizontal padding) — this is what the
 * "bare content" components (e.g. StatusMatrix, SovereignPath) expect.
 *
 * Components that render their OWN full-width <section> / full-bleed canvas
 * (AtmosphereReveal, StratosAgent, Install, Differentiators) must NOT be
 * double-constrained — pass `bleed` to skip the `.container-x` wrapper while
 * still getting the nav clearance and footer.
 */
export default function PageShell({
  children,
  bleed = false,
}: {
  children: React.ReactNode;
  bleed?: boolean;
}) {
  return (
    <main className="relative">
      <Nav />
      {/* clear the fixed header */}
      <div className="pt-28">
        {bleed ? children : <div className="container-x">{children}</div>}
      </div>
      <Footer />
    </main>
  );
}
