'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Shield, 
  Package,
  Store,
  CheckCircle2,
  ArrowRight,
  Truck,
  Headphones,
  Users,
  CreditCard,
  Percent,
  Settings,
  Globe
} from 'lucide-react';
import HomeCategories from '@/components/home/HomeCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PopularProducts from '@/components/home/PopularProducts';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      
      {/* 1. Hero Section with Pure Background Image Only */}
      <section 
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-16 pb-24" 
        style={{ backgroundImage: "url('/rr.jpeg')" }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-left space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Digital Multi-Vendor Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              More Choices <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                More Possibilities
              </span>
            </h1>

            <p className="text-gray-100 text-sm sm:text-base max-w-xl leading-relaxed drop-shadow-md">
              Discover top products from multiple trusted vendors — all in one place. Shop smart, shop with confidence at Wahisnova IMEX.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, vendors, or categories..."
                    className="w-full pl-10 pr-3 py-2 text-neutral-900 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-colors flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Stats Highlights Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">10K+</p>
                  <p className="text-xs text-gray-200">Products</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">500+</p>
                  <p className="text-xs text-gray-200">Trusted Vendors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20 text-green-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-white">100%</p>
                  <p className="text-xs text-gray-200">Secure Shopping</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Shop by Category Component */}
      <HomeCategories />

      {/* 3. Featured Products Component */}
      <FeaturedProducts />

      {/* 4. Popular Products Component */}
      <PopularProducts />

      {/* 5. Grow Your Business with Wahisnova IMEX Exact Layout Banner */}
      <section className="py-16 container mx-auto px-4">
        <div 
          className="relative rounded-3xl overflow-hidden bg-[#070b12] border border-amber-500/30 shadow-2xl p-6 sm:p-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/banner-bg.jpg')" }}
        >
          {/* Optional dark overlay if background image is too bright, remove if you want 100% clear image */}
          <div className="absolute inset-0 bg-[#04070d]/80"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Text and Button */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Become a Vendor
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Grow Your Business <br />
                <span className="text-amber-400">with Wahisnova IMEX</span>
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Join our trusted marketplace and reach millions of customers worldwide.
              </p>
              <div>
                <Link 
                  href="/vendor/register" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg"
                >
                  Start Selling <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Middle: Vendor/Person Image Area */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl">
                <Image 
                  src="/vendor-person.png" 
                  alt="Vendor" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Side: 4 Points List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Percent className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-white">Low Commission</span>
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-white">Easy Store Setup</span>
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-white">Global Audience</span>
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-white">24/7 Support</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Why Choose Wahisnova IMEX & Bottom Right Promo Section (Exact Image Match) */}
      <section className="py-12 border-t border-white/5 bg-[#05080e]">
        <div className="container mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Side: Why Choose Us (4 items) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">⚡</span> Why Choose Wahisnova IMEX?
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">We make online shopping simple, secure and enjoyable.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Secure Payment</h4>
                  <p className="text-[11px] text-gray-400">100% secure transactions</p>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Fast Delivery</h4>
                  <p className="text-[11px] text-gray-400">Global shipping support</p>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">Trusted Vendors</h4>
                  <p className="text-[11px] text-gray-400">Verified & reliable sellers</p>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">24/7 Support</h4>
                  <p className="text-[11px] text-gray-400">We're here to help</p>
                </div>
              </div>
            </div>

            {/* Right Side: Better Products, Bigger Savings Banner */}
            <div className="lg:col-span-5">
              <div 
                className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-amber-500/30 p-6 sm:p-8 flex items-center justify-between shadow-2xl bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/deals-bg.jpg')" }}
              >
                <div className="absolute inset-0 bg-[#060910]/85"></div>

                <div className="relative z-10 space-y-3 max-w-[220px]">
                  <span className="text-amber-400 text-xs font-semibold">— Special Offers</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    Better Products <br />
                    Bigger Savings
                  </h3>
                  <p className="text-xs text-gray-300">Shop smart. Save more.</p>
                  <div>
                    <Link 
                      href="/deals" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-md"
                    >
                      Explore Deals <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Shopping Bag Illustration / Image */}
                <div className="relative z-10 w-24 h-28 sm:w-32 sm:h-36 flex items-center justify-center">
                  <Image 
                    src="/shopping-bag.png" 
                    alt="Shopping Bag" 
                    fill 
                    className="object-contain drop-shadow-xl"
                  />
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}