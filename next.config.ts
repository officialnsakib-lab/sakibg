import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ভার্সেল বিল্ডের সময় টাইপস্ক্রিপ্ট এরর ইগনোর করবে
    ignoreBuildErrors: true,
  },
  eslint: {
    // বিল্ডের সময় লিন্ট এরর ইগনোর করবে
    ignoreDuringBuilds: true,
  },
  // বড় ফাইল এবং গ্যালারি ইমেজ আপলোড হ্যান্ডেল করার জন্য এটি যোগ করুন
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;