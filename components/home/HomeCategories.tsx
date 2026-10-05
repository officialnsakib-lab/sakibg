'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Globe, Code, Cpu, Palette, Puzzle, PenTool, 
  BookOpen, MoreHorizontal, Music, Video, Package,
  ShoppingBag, Briefcase, GraduationCap, UtensilsCrossed,
  Home as HomeIcon, HeartPulse, Plane, Shirt, Monitor,
  Clapperboard, Utensils, Trophy
} from 'lucide-react';

interface Category {
  name: string;
  count?: number;
  productCount?: number;
  slug?: string;
}

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        if (response.data.success) {
          const rawData = response.data.data;
          const items = Array.isArray(rawData) ? rawData : (rawData?.categories || []);
          setCategories(items);
        }
      } catch (error) {
        console.error('Categories error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const iconMap: any = {
    'food-items': Utensils,
    'foods': Utensils,
    'electronics': Monitor,
    'clothing': Shirt,
    'fashion': Shirt,
    'home-appliances': HomeIcon,
    'books': BookOpen,
    'fitness': Trophy,
    'toys': Puzzle,
    'beauty': HeartPulse,
    'accessories': ShoppingBag,
    'gadgets': Cpu,
    'templates': Globe,
    'software': Cpu,
    'graphics': Palette,
    'music': Music,
    'videos': Video,
    'courses': GraduationCap,
    'plugins': Puzzle,
    'themes': PenTool,
    'ecommerce': ShoppingBag,
    'business': Briefcase,
    'restaurant': UtensilsCrossed,
    'realestate': HomeIcon,
    'healthcare': HeartPulse,
    'travel': Plane,
    'entertainment': Clapperboard,
    'other': MoreHorizontal,
  };

  const colorMap: any = {
    'food-items': 'from-amber-500 to-orange-600',
    'electronics': 'from-blue-500 to-indigo-600',
    'clothing': 'from-pink-500 to-rose-600',
    'home-appliances': 'from-sky-500 to-blue-600',
    'books': 'from-green-500 to-teal-600',
    'fitness': 'from-yellow-500 to-amber-600',
    'toys': 'from-red-500 to-pink-600',
    'beauty': 'from-rose-500 to-red-600',
    'accessories': 'from-purple-500 to-violet-600',
    'gadgets': 'from-indigo-500 to-purple-600',
    'other': 'from-gray-500 to-slate-600',
  };

  if (loading) {
    return null;
  }

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
          Browse Categories
        </h2>
        
        {safeCategories.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No categories available.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {safeCategories.slice(0, 8).map((cat, index) => {
              const catName = cat.name || 'General';
              const catSlug = cat.slug || catName.toLowerCase().replace(/\s+/g, '-');
              const itemCount = cat.productCount ?? cat.count ?? 0;

              const Icon = iconMap[catSlug] || iconMap[catName.toLowerCase()] || Package;
              const color = colorMap[catSlug] || colorMap[catName.toLowerCase()] || 'from-gray-500 to-slate-600';
              
              return (
                <Link
                  key={catSlug + index}
                  href={`/physical-products?category=${encodeURIComponent(catSlug)}`}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all group border border-transparent hover:border-gray-200"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center capitalize line-clamp-1">
                    {catName}
                  </span>
                  <span className="text-[10px] text-gray-400">{itemCount} items</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}