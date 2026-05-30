import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, // À retirer en production
  },
  reactStrictMode: true, // Activé pour meilleure qualité de code
};

export default nextConfig;
