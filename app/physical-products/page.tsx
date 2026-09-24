'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Loader2, Package, X, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard'; // ফিজিক্যাল প্রোডাক্ট কার্ড
import ProductFilterSidebar from '@/components/product/ProductFilterSidebar';
import CategorySlider from '@/components/product/CategorySlider';
import Link from 'next/link';

export default function PhysicalProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{name: string, count: number}>>([]);
  const [priceRange, setPriceRange] = useState({ minPrice: 0, maxPrice: 1000000 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'popular', label: 'Best Selling' },
    { value: 'trending', label: 'Trending' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { 
        type: 'physical', // ফিজিক্যাল প্রোডাক্টের জন্য টাইপ ফিজিক্যাল করা হলো
        page, 
        limit, 
        sort 
      };
      
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating !== '0') params.minRating = minRating;
      if (inStockOnly) params.inStock = true;
      
      const response = await axios.get('/api/products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setCategories(response.data.data.categories || []);
        setPriceRange(response.data.data.priceRange || { minPrice: 0, maxPrice: 0 });
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalProducts(response.data.data.pagination.total);
        
        const filters: string[] = [];
        if (search) filters.push(`Search: ${search}`);
        if (selectedCategory !== 'all') filters.push(`Category: ${selectedCategory}`);
        if (minPrice) filters.push(`Min: ৳${minPrice}`);
        if (maxPrice) filters.push(`Max: ৳${maxPrice}`);
        if (minRating !== '0') filters.push(`${minRating}★+`);
        if (inStockOnly) filters.push('In Stock');
        setActiveFilters(filters);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, minPrice, maxPrice, minRating, inStockOnly, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('0');
    setInStockOnly(false);
    setSort('recommended');
    setPage(1);
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith('Search:')) { setSearch(''); setSearchInput(''); }
    if (filter.startsWith('Category:')) setSelectedCategory('all');
    if (filter.startsWith('Min:')) setMinPrice('');
    if (filter.startsWith('Max:')) setMaxPrice('');
    if (filter.includes('★')) setMinRating('0');
    if (filter === 'In Stock') setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header Banner with Golden Accent */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-black border-b border-slate-800 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mb-2">
              Physical Products Store
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" /> সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি ({totalProducts} টি পণ্য উপলব্ধ)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/cart" 
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-semibold rounded-xl hover:from-amber-300 hover:to-amber-400 shadow-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>View Cart / Checkout</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ফিজিক্যাল প্রোডাক্ট সার্চ করুন..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-all">
                Search
              </button>
            </form>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              {activeFilters.map((filter, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs rounded-full">
                  {filter}
                  <button onClick={() => removeFilter(filter)}>
                    <X className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              ))}
              <button onClick={handleClearFilters} className="text-xs text-red-400 hover:underline font-medium ml-2">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="md:flex gap-8">
          {/* Sidebar Filters */}
          <ProductFilterSidebar
            categories={categories}
            priceRange={priceRange}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Products Grid & Categories */}
          <div className="flex-1">
            <CategorySlider
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {loading ? (
              <div className="text-center py-24">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          page === i + 1 
                            ? 'bg-amber-500 text-slate-950 shadow-md' 
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-2xl">
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">কোন ফিজিক্যাল প্রোডাক্ট পাওয়া যায়নি</h3>
                <p className="text-slate-400 text-sm mt-1 mb-6">অন্য ফিল্টার বা কিওয়ার্ড দিয়ে সার্চ করুন।</p>
                <button onClick={handleClearFilters} className="px-6 py-2.5 bg-amber-500 text-slate-950 font-semibold rounded-xl hover:bg-amber-400 transition-all">
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}