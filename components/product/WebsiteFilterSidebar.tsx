'use client';

import React, { useState } from 'react';
import { 
  Star, 
  BadgeCheck, 
  Award, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Globe
} from 'lucide-react';

interface Category {
  name: string;
  count: number;
}

interface WebsiteFilterSidebarProps {
  categories: Category[];
  priceRange: { minPrice: number; maxPrice: number };
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  minRating: string;
  setMinRating: (val: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  premiumOnly: boolean;
  setPremiumOnly: (val: boolean) => void;
  adsenseOnly: boolean;
  setAdsenseOnly: (val: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function WebsiteFilterSidebar({
  categories,
  priceRange,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
  premiumOnly,
  setPremiumOnly,
  adsenseOnly,
  setAdsenseOnly,
  onApplyFilters,
  onClearFilters,
}: WebsiteFilterSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 8);

  const FiltersContent = (
    <div className="space-y-5">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-600" />
          Website Categories
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-50 text-green-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>All Websites</span>
            <span className="text-xs text-gray-400">{categories.reduce((sum, c) => sum + c.count, 0)}</span>
          </button>

          {displayedCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-green-50 text-green-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="capitalize">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </button>
          ))}

          {categories.length > 8 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
            >
              {showAllCategories ? (
                <>Show Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>See All ({categories.length}) <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={`$${priceRange.minPrice}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={`$${priceRange.maxPrice}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Minimum Rating</h3>
        <div className="space-y-1.5">
          {['0', '4', '4.5', '5'].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                minRating === rating
                  ? 'bg-green-50 text-green-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {rating === '0' ? (
                <span>Any Rating</span>
              ) : (
                <>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < parseFloat(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span>{parseFloat(rating)}+</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Checkbox Filters */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <BadgeCheck className="w-4 h-4 text-blue-500" />
            Verified Sellers
          </span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <Award className="w-4 h-4 text-yellow-500" />
            Premium Products
          </span>
          <input
            type="checkbox"
            checked={premiumOnly}
            onChange={(e) => setPremiumOnly(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign className="w-4 h-4 text-green-500" />
            Adsense Approved
          </span>
          <input
            type="checkbox"
            checked={adsenseOnly}
            onChange={(e) => setAdsenseOnly(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded"
          />
        </label>
      </div>

      {/* Buttons */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <button
          onClick={onApplyFilters}
          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
        >
          Apply Filters
        </button>
        <button
          onClick={onClearFilters}
          className="w-full px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Clear All
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-5 sticky top-28">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600" />
            Filters
          </h2>
          {FiltersContent}
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowMobileFilters(false)}>
            <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              {FiltersContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}