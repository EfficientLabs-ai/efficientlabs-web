import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Michroma } from "next/font/google";
import "./globals.css";

// Distinctive type: Clash Display (headlines) + General Sans (body) from Fontshare,
// JetBrains Mono (the content-addressing / hash motif) + Chakra Petch (the squared,
// chamfered-corner wordmark, matching the Efficient Labs logo) from Google.
const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb-mono", display: "swap" });
const michroma = Michroma({ subsets: ["latin"], weight: ["400"], variable: "--font-wordmark", display: "swap" });

export const metadata: Metadata = {
  title: "Efficient Labs — Sovereign AI infrastructure",
  description:
    "StratosAgent runs on your hardware. The Atmosphere meshes it with the world — content-addressed, capability-secured, post-quantum. No central server can seize, censor, or surveil it.",
  metadataBase: new URL("https://efficientlabs.ai"),
  // pre-launch: keep the preview out of search indexes until go-live
  robots: { index: false, follow: false },
  openGraph: {
    title: "Efficient Labs — Sovereign AI infrastructure",
    description: "The sovereign internet for AI agents. Content-addressed, capability-secured, post-quantum.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jbMono.variable} ${michroma.variable}`}>
      <head>
        {/* Clash Display + General Sans — distinctive, premium, not the generic stack */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700,500,400&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
