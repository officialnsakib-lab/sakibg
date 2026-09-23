'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, ChevronDown, Loader2, Globe, X } from 'lucide-react';
import WebsiteCard from '@/components/product/WebsiteCard';
import WebsiteFilterSidebar from '@/components/product/WebsiteFilterSidebar';
import CategorySlider from '@/components/product/CategorySlider';
export default function WebsiteDemosPage() {
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
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [adsenseOnly, setAdsenseOnly] = useState(false);
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
    { value: 'premium', label: 'Premium First' },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { 
        type: 'website', 
        page, 
        limit, 
        sort 
      };
      
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating !== '0') params.minRating = minRating;
      if (verifiedOnly) params.verified = true;
      if (premiumOnly) params.premium = true;
      if (adsenseOnly) params.adsenseApproved = true;
      
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
        if (minPrice) filters.push(`Min: $${minPrice}`);
        if (maxPrice) filters.push(`Max: $${maxPrice}`);
        if (minRating !== '0') filters.push(`${minRating}★+`);
        if (verifiedOnly) filters.push('Verified');
        if (premiumOnly) filters.push('Premium');
        if (adsenseOnly) filters.push('Adsense');
        setActiveFilters(filters);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, minPrice, maxPrice, minRating, verifiedOnly, premiumOnly, adsenseOnly, sort, page]);

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
    setVerifiedOnly(false);
    setPremiumOnly(false);
    setAdsenseOnly(false);
    setSort('recommended');
    setPage(1);
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith('Search:')) { setSearch(''); setSearchInput(''); }
    if (filter.startsWith('Category:')) setSelectedCategory('all');
    if (filter.startsWith('Min:')) setMinPrice('');
    if (filter.startsWith('Max:')) setMaxPrice('');
    if (filter.includes('★')) setMinRating('0');
    if (filter === 'Verified') setVerifiedOnly(false);
    if (filter === 'Premium') setPremiumOnly(false);
    if (filter === 'Adsense') setAdsenseOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Website Templates</h1>
          <p className="text-white/80 text-sm">{totalProducts} websites available</p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search website templates..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                Search
              </button>
            </form>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map((filter, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                  {filter}
                  <button onClick={() => removeFilter(filter)}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
              <button onClick={handleClearFilters} className="text-xs text-red-500 font-medium">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="md:flex gap-6">
          {/* Sidebar */}
          <WebsiteFilterSidebar
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
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            premiumOnly={premiumOnly}
            setPremiumOnly={setPremiumOnly}
            adsenseOnly={adsenseOnly}
            setAdsenseOnly={setAdsenseOnly}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {/* Category Slider */}
              <CategorySlider
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) => (
                    <WebsiteCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 sm:gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                          page === i + 1 ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">No Websites Found</h3>
                <button onClick={handleClearFilters} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}