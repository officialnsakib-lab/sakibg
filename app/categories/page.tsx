'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Globe, ShoppingBag, Loader2, Package, ChevronRight, 
  Smartphone, Shirt, Laptop, Sparkles, HeartPulse, Trophy, Car, Home
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  productCount?: number;
  count?: number;
}

export default function GlobalCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalCategories();
  }, []);

  const fetchGlobalCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      const responseData = response.data;
      let categoriesArray: Category[] = [];

      if (Array.isArray(responseData)) {
        categoriesArray = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        categoriesArray = responseData.data;
      } else if (responseData && Array.isArray(responseData.categories)) {
        categoriesArray = responseData.categories;
      }

      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ক্যাটাগরির জন্য আইকন ম্যাপিং
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'gadgets':
      case 'electronics': return Smartphone;
      case 'clothing':
      case 'fashion': return Shirt;
      case 'laptop':
      case 'computers': return Laptop;
      case 'home-living': return Home;
      case 'health-beauty': return HeartPulse;
      case 'sports-fitness': return Trophy;
      case 'automotive': return Car;
      default: return Sparkles;
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  // ডিজিটাল এবং ফিজিক্যাল ক্যাটাগরি আলাদা করা (নাম বা টাইপ অনুযায়ী)
  const digitalCategories = safeCategories.filter(
    cat => cat.type === 'digital' || cat.slug?.includes('digital') || cat.name?.toLowerCase().includes('digital')
  );

  const physicalCategories = safeCategories.filter(
    cat => !digitalCategories.includes(cat)
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Explore Categories
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Discover digital and physical products from trusted vendors.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          </div>
        ) : safeCategories.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200">No Categories Found</h3>
            <p className="text-gray-400 text-sm mt-1">Please add categories from your database or admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ১. ডিজিটাল প্রোডাক্টস ফোল্ডার */}
            <div className="relative bg-gradient-to-b from-gray-900/90 to-gray-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
                  <Globe className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-400 tracking-wide">DIGITAL PRODUCTS</h2>
                  <p className="text-xs text-gray-400">Instant access. Endless possibilities.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {digitalCategories.length > 0 ? (
                  digitalCategories.map((cat) => {
                    const IconComp = getCategoryIcon(cat.slug);
                    return (
                      <Link
                        key={cat._id}
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="group bg-gray-900/60 hover:bg-amber-500/10 border border-gray-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-800 text-amber-400 group-hover:scale-110 flex items-center justify-center mb-3 transition-transform">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-300 group-hover:text-amber-300 line-clamp-2">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1">{cat.productCount || cat.count || 0} items</span>
                        <ChevronRight className="w-3 h-3 text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })
                ) : (
                  <p className="col-span-4 text-center text-sm text-gray-500 py-6">No digital categories found.</p>
                )}
              </div>
            </div>

            {/* ২. ফিজিক্যাল প্রোডাক্টস ফোল্ডার */}
            <div className="relative bg-gradient-to-b from-gray-900/90 to-gray-950 border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-400 tracking-wide">PHYSICAL PRODUCTS</h2>
                  <p className="text-xs text-gray-400">Real products. Delivered to your door.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {physicalCategories.length > 0 ? (
                  physicalCategories.map((cat) => {
                    const IconComp = getCategoryIcon(cat.slug);
                    return (
                      <Link
                        key={cat._id}
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="group bg-gray-900/60 hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-800 text-blue-400 group-hover:scale-110 flex items-center justify-center mb-3 transition-transform">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-300 group-hover:text-blue-300 line-clamp-2">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1">{cat.productCount || cat.count || 0} items</span>
                        <ChevronRight className="w-3 h-3 text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })
                ) : (
                  <p className="col-span-4 text-center text-sm text-gray-500 py-6">No physical categories found.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-16 text-xs text-gray-500">
          Wahisnova IMEX — Your Marketplace for Digital & Physical Products
        </div>

      </div>
    </div>
  );
}