'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Globe, Cpu, Palette, BookOpen, ShoppingBag, 
  Car, HeartPulse, Trophy, Loader2, Package, ChevronRight 
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
      const response = await axios.get('/api/categories/global');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching global categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // আইকন ম্যাপিং
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'electronics': return Cpu;
      case 'fashion': return Palette;
      case 'home-living': return ShoppingBag;
      case 'digital-products': return Globe;
      case 'health-beauty': return HeartPulse;
      case 'sports-fitness': return Trophy;
      case 'automotive': return Car;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 md:p-12 text-white text-center mb-10 shadow-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">World's All Categories & Products</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-base">
            Explore millions of physical goods, digital assets, and services categorized globally for your convenience.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No Categories Found</h3>
            <p className="text-gray-500 text-sm mt-1">Please add categories from your admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              return (
                <div 
                  key={category._id} 
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50/30 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                        <span className="text-xs text-indigo-600 font-medium">Global Department</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-categories List */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sub-Categories</h4>
                      {category.subCategories && category.subCategories.length > 0 ? (
                        category.subCategories.map((sub) => (
                          <Link
                            key={sub._id}
                            href={`/categories/${category.slug}/${sub.slug}`}
                            className="flex items-center justify-between p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors text-sm group"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No sub-categories added yet.</p>
                      )}
                    </div>

                    {/* View All Button */}
                    <Link
                      href={`/categories/${category.slug}`}
                      className="w-full py-2.5 px-4 bg-gray-900 hover:bg-indigo-600 text-white text-center rounded-xl font-medium text-sm transition-colors block shadow-sm"
                    >
                      Browse All in {category.name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}