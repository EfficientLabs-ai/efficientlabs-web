import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeRoot } from "@/components/useSiteTheme";
import MotionProvider from "@/components/MotionProvider";
import BackToTop from "@/components/BackToTop";
import StructuredData from "@/components/StructuredData";

// Brand kit type system (EFFICIENT_LABS_BRAND_KIT.md): Space Grotesk (headings) +
// Inter (body) + JetBrains Mono (terminal/code/data). Michroma is the wide-tracked
// geometric wordmark face. ALL self-hosted via next/font/local from app/fonts/
// (latin-subset woff2) so the BUILD IS HERMETIC — no Google Fonts fetch at compile
// time. Inter / Space Grotesk / JetBrains Mono are variable fonts (weight ranges).
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-latin-var.woff2",
  weight: "300 700",
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = localFont({
  src: "./fonts/Inter-latin-var.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});
const jbMono = localFont({
  src: "./fonts/JetBrainsMono-latin-var.woff2",
  weight: "100 800",
  variable: "--font-jb-mono",
  display: "swap",
});
const michroma = localFont({
  src: "./fonts/Michroma-latin-400.woff2",
  weight: "400",
  variable: "--font-wordmark",
  display: "swap",
});

const TITLE = "Efficient Labs — The operating system for AI you own";
const DESCRIPTION =
  "Own and prove everything your AI does. A verifiable System-2 layer you own, wrapping any LLM — local-first, your compute and data, with receipts anyone can verify.";
const OG_IMAGE = "/img/og-efficient-labs.jpg";

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
    description: "Own and prove everything your AI does — a verifiable System-2 layer you own, wrapping any LLM, with receipts anyone can verify.",
    siteName: "Efficient Labs",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Efficient Labs — Intelligence · Continuity · Infrastructure · Ownership · Optimization" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Own and prove everything your AI does — a verifiable System-2 layer you own, wrapping any LLM, with receipts anyone can verify.",
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  // Site default is DARK (cinematic brand). Light is an opt-in toggle, not the
  // default — so the unconditional chrome colour is the dark canvas. We still
  // expose the light value behind the light media query for users who toggle.
  themeColor: [
    { color: "#0b0f1a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jbMono.variable} ${michroma.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
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
        {/* Machine-readable facts for search + answer engines (Google, ChatGPT,
            Claude, Perplexity, Gemini). Twin of /public/llms.txt. */}
        <StructuredData />
      </head>
      <body>
        <MotionProvider />
        <ThemeRoot>{children}</ThemeRoot>
        <BackToTop />
      </body>
    </html>
  );
}
