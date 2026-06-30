import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",  // commented for local dev
  typescript: {
    ignoreBuildErrors: true, // À retirer en production
  },
  reactStrictMode: true, // Activé pour meilleure qualité de code
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
