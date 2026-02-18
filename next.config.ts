import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next/Image to work with dynamically uploaded images
    unoptimized: false,
  },
};

export default nextConfig;
