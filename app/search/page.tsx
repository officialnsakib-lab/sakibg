'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Search, 
  Star, 
  Package,
  Globe,
  Loader2,
  X
} from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products', {
        params: { search: query, page, limit: 12 }
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Search products, websites..."
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold">
                Search
              </button>
            </div>
          </form>
          
          {query && (
            <p className="text-gray-500 mt-3">
              {total} results for "<span className="font-semibold">{query}</span>"
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/digital-products/${product._id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-44 bg-gradient-to-br from-indigo-500 to-violet-600">
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {product.productType === 'website' ? (
                        <Globe className="w-12 h-12 text-white/50" />
                      ) : (
                        <Package className="w-12 h-12 text-white/50" />
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">No Results Found</h3>
            <p className="text-gray-500">Try different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}