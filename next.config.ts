import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      // Consolidate the signed-in home: /app (the OS) is canonical; the older
      // /dashboard control plane redirects to it so there's one control plane.
      { source: "/dashboard", destination: "/app", permanent: true },
    ];
  },
};

export default nextConfig;
