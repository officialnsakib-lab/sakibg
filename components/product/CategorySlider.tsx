'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySliderProps {
  categories: Array<{ name: string; count: number }>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySlider({ categories, selectedCategory, onSelectCategory }: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 0);
      setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = 200;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkArrows, 300);
    }
  };

  return (
    <div className="relative mb-6">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Categories Slider */}
      <div
        ref={scrollRef}
        onScroll={checkArrows}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Category */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All Websites
        </button>

        {/* Category Items */}
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.name
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="capitalize">{cat.name}</span>
            <span className={`ml-1 text-xs ${selectedCategory === cat.name ? 'text-white/70' : 'text-gray-400'}`}>
              ({cat.count})
            </span>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}