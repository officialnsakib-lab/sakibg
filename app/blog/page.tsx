'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
  // সব ব্লগ পোস্টের জন্য tt.png লোকাল পাথ ব্যবহার করা হয়েছে
  const blogPosts = [
    {
      id: '1',
      title: 'The Future of Multi-Vendor Marketplaces in 2026',
      category: 'E-Commerce Trends',
      date: 'September 25, 2026',
      readTime: '4 min read',
      image: '/images/tt.png',
      excerpt: 'Discover how digital and physical products are merging under single multi-vendor platforms to transform global online shopping experiences.'
    },
    {
      id: '2',
      title: 'How to Scale Your Digital Product Sales Effectively',
      category: 'Vendor Tips',
      date: 'September 18, 2026',
      readTime: '6 min read',
      image: '/images/tt.png',
      excerpt: 'Essential strategies for software developers, e-book authors, and digital creators to maximize visibility and revenue on marketplaces.'
    },
    {
      id: '3',
      title: 'Secure Online Transactions: What Buyers Need to Know',
      category: 'Security & Trust',
      date: 'September 10, 2026',
      readTime: '5 min read',
      image: '/images/tt.png',
      excerpt: 'A comprehensive guide on how our platform ensures encrypted checkout, protected vendor payouts, and safe digital asset delivery.'
    },
    {
      id: '4',
      title: 'Top 5 Advantages of Starting as a Verified Vendor',
      category: 'Business Growth',
      date: 'September 02, 2026',
      readTime: '4 min read',
      image: '/images/tt.png',
      excerpt: 'Learn why becoming a verified seller builds instant customer trust and accelerates brand recognition in a competitive digital market.'
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