'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
  // কাস্টমার এবং সেলার উভয়ের আস্থা অর্জনের জন্য ১০টি সাজানো ব্লগ পোস্ট
  const blogPosts = [
    {
      id: '1',
      title: 'How Local Food & Craft Vendors Scale Nationwide Safely',
      category: 'Vendor Success',
      date: 'October 06, 2026',
      readTime: '4 min read',
      image: '/ww.png',
      excerpt: 'Discover how local food makers and physical product sellers expand their customer base across the country with verified marketplace tools.'
    },
    {
      id: '2',
      title: 'Shop with Absolute Trust: Our Secure Cash on Delivery Policy',
      category: 'Buyer Security',
      date: 'October 04, 2026',
      readTime: '5 min read',
      image: '/ww 2.png',
      excerpt: 'Learn why nationwide Cash on Delivery (COD) ensures complete peace of mind, allowing you to inspect your physical and food items before paying.'
    },
    {
      id: '3',
      title: 'Welcome Offer: Enjoy Free Delivery on Your First Order',
      category: 'Special Offers',
      date: 'October 02, 2026',
      readTime: '3 min read',
      image: '/xx.png',
      excerpt: 'New to our platform? Register your free account today and unlock instant free delivery rewards on your very first purchase.'
    },
    {
      id: '4',
      title: 'Freshness Guaranteed: How We Inspect Quality Food Vendors',
      category: 'Quality Control',
      date: 'September 28, 2026',
      readTime: '4 min read',
      image: '/xx2.png',
      excerpt: 'A behind-the-scenes look at our rigorous vendor verification standards to ensure hygienic, fresh, and delicious food reaches your table.'
    },
    {
      id: '5',
      title: 'Maximize Your Savings: Using 10% Discount Tickets at Checkout',
      category: 'Smart Shopping',
      date: 'September 25, 2026',
      readTime: '4 min read',
      image: '/xxx.png',
      excerpt: 'Step-by-step guide on how to claim promotional discount tokens from our homepage slider and apply them instantly to lower your cart total.'
    },
    {
      id: '6',
      title: 'Top 5 Benefits of Becoming a Verified Marketplace Seller',
      category: 'Vendor Growth',
      date: 'September 20, 2026',
      readTime: '6 min read',
      image: '/zz.png',
      excerpt: 'Explore why verified vendor status builds instant buyer trust, boosts store visibility, and accelerates your daily brand revenue.'
    },
    {
      id: '7',
      title: 'Fast & Reliable Logistics: From Vendor Kitchen to Your Doorstep',
      category: 'Delivery & Shipping',
      date: 'September 15, 2026',
      readTime: '5 min read',
      image: '/78.png',
      excerpt: 'Understand our streamlined packaging and shipping network designed specifically to keep physical goods intact and food fresh during transit.'
    },
    {
      id: '8',
      title: 'Transparent Payouts and Protected Earnings for Sellers',
      category: 'Vendor Finance',
      date: 'September 10, 2026',
      readTime: '4 min read',
      image: '/yq.png',
      excerpt: 'How our multi-vendor platform ensures on-time, transparent withdrawals and automated commission tracking for all active business partners.'
    },
    {
      id: '9',
      title: 'Why Customer Reviews Matter in a Multi-Vendor Marketplace',
      category: 'Community Trust',
      date: 'September 05, 2026',
      readTime: '4 min read',
      image: '/y5.png',
      excerpt: 'Discover how honest buyer feedback helps maintain high service standards and guides shoppers to the most reliable physical and food items.'
    },
    {
      id: '10',
      title: 'The Future of E-Commerce: Blending Physical Goods & Local Foods',
      category: 'Market Trends',
      date: 'September 01, 2026',
      readTime: '5 min read',
      image: '/t6.png',
      excerpt: 'An insightful overview of how unified multi-vendor platforms are transforming everyday retail shopping and food delivery habits nationwide.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-4">
          Insights & Updates
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-4">
          Our Latest Blog Posts
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
          Explore expert tips, e-commerce strategies, marketplace updates, and guides from the Wahisnova IMEX team.
        </p>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <article 
            key={post.id}
            className="bg-[#0c121d] rounded-2xl overflow-hidden border border-amber-500/20 shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col group"
          >
            {/* Blog Image Container */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-neutral-900">
              <Image 
                src={post.image} 
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c121d] via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                  <span>📅 {post.date}</span>
                  <span>•</span>
                  <span>⏱️ {post.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-amber-200 mb-3 group-hover:text-amber-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div>
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Read Full Article <span>→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}