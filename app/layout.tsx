import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Michroma } from "next/font/google";
import "./globals.css";
import { ThemeRoot } from "@/components/useSiteTheme";

// Distinctive type: Clash Display (headlines) + General Sans (body) from Fontshare,
// JetBrains Mono (the content-addressing / hash motif) + Chakra Petch (the squared,
// chamfered-corner wordmark, matching the Efficient Labs logo) from Google.
const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb-mono", display: "swap" });
const michroma = Michroma({ subsets: ["latin"], weight: ["400"], variable: "--font-wordmark", display: "swap" });

const TITLE = "Efficient Labs — Sovereign AI infrastructure";
const DESCRIPTION =
  "StratosAgent runs on your hardware. The Atmosphere meshes it with the world — content-addressed, capability-secured, post-quantum. No central server can seize, censor, or surveil it.";
const OG_IMAGE = "/img/launch-reveal-wide.png";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s — Efficient Labs" },
  description: DESCRIPTION,
  metadataBase: new URL("https://efficientlabs.ai"),
  applicationName: "Efficient Labs",
  keywords: [
    "sovereign AI", "local-first AI agent", "StratosAgent", "The Atmosphere",
    "peer-to-peer compute", "post-quantum", "self-hosted AI", "data sovereignty",
    "private AI infrastructure", "no cloud AI",
  ],
  authors: [{ name: "Efficient Labs" }],
  creator: "Efficient Labs",
  // go-live: indexable by default. Each route sets its own canonical + og:url;
  // private routes (below) set their own noindex. Private routes are also
  // excluded from crawling via app/robots.ts.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: TITLE,
    description: "The sovereign internet for AI agents. Content-addressed, capability-secured, post-quantum.",
    siteName: "Efficient Labs",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1376, height: 768, alt: "Efficient Labs — The Atmosphere sovereign mesh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "The sovereign internet for AI agents. Content-addressed, capability-secured, post-quantum.",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  // Site default is DARK (cinematic brand). Light is an opt-in toggle, not the
  // default — so the unconditional chrome colour is the dark canvas. We still
  // expose the light value behind the light media query for users who toggle.
  themeColor: [
    { color: "#010207" },
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#010207" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jbMono.variable} ${michroma.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Pre-paint: honour the stored site theme on <html> BEFORE first paint so
            there is no dark↔light flash on load. Default DARK when unset (the
            cinematic brand). Shares no key with the OS (#os-root uses 'os-theme');
            the site uses 'efl-theme'. Light is an opt-in toggle, not the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('efl-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        {/* Clash Display + General Sans — distinctive, premium, not the generic stack */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700,500,400&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRoot>{children}</ThemeRoot>
      </body>
    </html>
  );
}
