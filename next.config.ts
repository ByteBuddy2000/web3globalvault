import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.newsapi.org',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.media.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.**',
      },
      {
        protocol: 'https',
        hostname: '**.com',
      },
    ],
  },
};

export default nextConfig;















































































































































