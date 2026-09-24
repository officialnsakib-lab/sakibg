import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ভার্সেল বিল্ডের সময় টাইপস্ক্রিপ্ট এরর ইগনোর করবে
    ignoreBuildErrors: true,
  },
  eslint: {
    // বিল্ডের সময় লিন্ট এরর ইগনোর করবে
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;