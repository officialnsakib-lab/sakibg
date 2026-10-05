'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { useCurrency } from '@/context/CurrencyContext'; // ১. কারেন্সি হুক ইমপোর্ট করা হলো

interface RelatedProductsProps {
  products: any[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency(); // ২. কারেন্সি ফরম্যাটার কল করা হলো

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  // নিখুঁতভাবে প্রাইজ পার্স করার ফাংশন
  const parsePrice = (val: any) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'object') {
      return Number(val.$numberDecimal || val.value || 0) || 0;
    }
    return Number(val) || 0;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Related Products</h2>

      {/* Left Arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-indigo-600"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product) => {
          const originalPrice = parsePrice(product.price);
          const rawSalePrice = parsePrice(product.salePrice);
          const finalPrice = rawSalePrice > 0 && rawSalePrice < originalPrice ? rawSalePrice : originalPrice;

          return (
            <Link
              key={product._id}
              href={`/physical-products/${product._id}`} // ৩. সঠিক ফিজিক্যাল প্রোডাক্ট রাউট
              className="flex-shrink-0 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group border border-gray-100 dark:border-slate-800"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center relative overflow-hidden">
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Package className="w-8 h-8 text-white/50" />
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm line-clamp-2 group-hover:text-indigo-600">{product.title}</h3>
                <div className="flex items-center gap-1 my-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{product.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-xs text-gray-400">({formatNumber(product.totalReviews || 0)})</span>
                </div>
                {/* ৪. ডাইনামিক কারেন্সি ফরম্যাটার ব্যবহার করা হলো */}
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(finalPrice)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-indigo-600"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}