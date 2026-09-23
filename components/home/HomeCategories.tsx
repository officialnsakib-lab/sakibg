'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Globe, Code, Cpu, Palette, Puzzle, PenTool, 
  BookOpen, MoreHorizontal, Music, Video, Package,
  ShoppingBag, Briefcase, GraduationCap, UtensilsCrossed,
  Home as HomeIcon, HeartPulse, Plane, Shirt, Monitor,
  Clapperboard
} from 'lucide-react';

interface Category {
  name: string;
  count: number;
}

export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        if (response.data.success) {
          setCategories(response.data.data.categories);
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
    'templates': Globe,
    'software': Cpu,
    'ebooks': BookOpen,
    'graphics': Palette,
    'music': Music,
    'videos': Video,
    'courses': GraduationCap,
    'plugins': Puzzle,
    'themes': PenTool,
    'ecommerce': ShoppingBag,
    'blog': PenTool,
    'portfolio': Briefcase,
    'business': Briefcase,
    'education': GraduationCap,
    'restaurant': UtensilsCrossed,
    'realestate': HomeIcon,
    'healthcare': HeartPulse,
    'travel': Plane,
    'fashion': Shirt,
    'technology': Monitor,
    'entertainment': Clapperboard,
    'other': MoreHorizontal,
  };

  const colorMap: any = {
    'templates': 'from-blue-500 to-indigo-600',
    'software': 'from-purple-500 to-violet-600',
    'ebooks': 'from-green-500 to-teal-600',
    'graphics': 'from-pink-500 to-rose-600',
    'music': 'from-orange-500 to-red-600',
    'videos': 'from-cyan-500 to-blue-600',
    'courses': 'from-yellow-500 to-amber-600',
    'plugins': 'from-red-500 to-pink-600',
    'themes': 'from-indigo-500 to-purple-600',
    'ecommerce': 'from-emerald-500 to-green-600',
    'blog': 'from-blue-500 to-cyan-600',
    'portfolio': 'from-violet-500 to-purple-600',
    'business': 'from-slate-500 to-gray-600',
    'education': 'from-teal-500 to-emerald-600',
    'restaurant': 'from-amber-500 to-orange-600',
    'realestate': 'from-sky-500 to-blue-600',
    'healthcare': 'from-rose-500 to-red-600',
    'travel': 'from-cyan-500 to-teal-600',
    'fashion': 'from-pink-500 to-fuchsia-600',
    'technology': 'from-indigo-500 to-blue-600',
    'entertainment': 'from-purple-500 to-pink-600',
    'other': 'from-gray-500 to-slate-600',
  };

  if (loading) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
          Browse Categories
        </h2>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((cat) => {
            const Icon = iconMap[cat.name] || Package;
            const color = colorMap[cat.name] || 'from-gray-500 to-slate-600';
            
            return (
              <Link
                key={cat.name}
                href={`/digital-products?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all group border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center capitalize line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-400">{cat.count} items</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}