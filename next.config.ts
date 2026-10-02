import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent React from mounting and running effects twice during dev for maximum UI speed
  reactStrictMode: false,

  // Drastically accelerate Next.js compilation by tree-shaking heavy library exports
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@base-ui/react',
      'zod',
    ],
  },

  // High-performance image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Long-term immutable caching for static logos, fonts, and assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
