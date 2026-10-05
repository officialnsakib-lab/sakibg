'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  ShoppingBag, 
  Car, HeartPulse, Trophy, Loader2, Package, ChevronRight,
  Smartphone, Shirt, Home, Sparkles, Utensils
} from 'lucide-react';

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  subCategories?: SubCategory[];
  productCount?: number;
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

  // ক্যাটাগরি বা সাব-ক্যাটাগরির জন্য আইকন ম্যাপিং (ফুড আইটেম সহ)
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'food-items':
      case 'foods': return Utensils;
      case 'electronics': return Smartphone;
      case 'fashion': return Shirt;
      case 'home-living': return Home;
      case 'health-beauty': return HeartPulse;
      case 'sports-fitness': return Trophy;
      case 'automotive': return Car;
      default: return Sparkles;
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Explore Categories
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Discover physical products and delicious food items from trusted vendors.
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
          <div className="relative bg-gradient-to-b from-gray-900/90 to-gray-950 border border-blue-500/35 rounded-3xl p-6 md:p-10 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-400 tracking-wide">PHYSICAL PRODUCTS & FOOD ITEMS</h2>
                <p className="text-xs text-gray-400">Real products & fresh foods. Delivered to your door.</p>
              </div>
            </div>

            {/* ক্যাটাগরি গ্রিড */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {safeCategories.map((cat) => {
                const IconComp = getCategoryIcon(cat.slug);
                return (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    className="group bg-gray-900/60 hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-800 text-blue-400 group-hover:scale-110 flex items-center justify-center mb-3 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-blue-300 line-clamp-2">
                      {cat.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-16 text-xs text-gray-500">
          Wahisnova IMEX — Your Marketplace for Physical Products & Foods
        </div>

      </div>
    </div>
  );
}