'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ProductFilterSidebarProps {
  categories: Array<{ name: string; count: number }>;
  priceRange: { minPrice: number; maxPrice: number };
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minRating: string;
  setMinRating: (val: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function ProductFilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  onApplyFilters,
  onClearFilters,
}: ProductFilterSidebarProps) {
  return (
    <div className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-200 h-fit mb-6 md:mb-0 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="font-bold text-slate-100">Filters</h3>
        <button 
          onClick={onClearFilters}
          className="text-xs text-amber-400 hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-slate-300">Categories</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-sm">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'all' ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-all flex justify-between items-center ${
                selectedCategory === cat.name ? 'bg-amber-500 text-slate-950 font-semibold' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-slate-800 pt-4">
        <h4 className="text-sm font-semibold mb-3 text-slate-300">Price (৳)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <span className="text-slate-500">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-t border-slate-800 pt-4">
        <h4 className="text-sm font-semibold mb-3 text-slate-300">Minimum Rating</h4>
        <div className="space-y-1.5 text-sm">
          {['0', '4', '3', '2'].map((rate) => (
            <label key={rate} className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="radio"
                name="rating"
                checked={minRating === rate}
                onChange={() => setMinRating(rate)}
                className="accent-amber-500"
              />
              <span className="flex items-center gap-1">
                {rate === '0' ? 'All Ratings' : <>{rate} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" /> & up</>}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="border-t border-slate-800 pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          In Stock Only
        </label>
      </div>

      <button
        onClick={onApplyFilters}
        className="w-full py-2.5 bg-amber-500 text-slate-950 font-semibold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-md"
      >
        Apply Filters
      </button>
    </div>
  );
}