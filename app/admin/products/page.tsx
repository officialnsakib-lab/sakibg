'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  X, 
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Globe,
  Star,
  Eye,
  ExternalLink,
  Trash2,
  Filter,
  Download,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  productType: string;
  category: string;
  price: number;
  salePrice: number | null;
  thumbnailUrl: string;
  demoUrl: string;
  averageRating: number;
  totalReviews: number;
  sales: number;
  views: number;
  downloads: number;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  vendorId: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  rejectionReason?: string;
}

export default function AdminProductsPage() {
  // ============ STATE ============
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 12;
  
  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'digital' | 'website'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price_high' | 'price_low' | 'popular'>('newest');
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============ FETCH PRODUCTS ============
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        type: filterType,
        status: filterStatus,
        sort: sortOrder,
      };
      
      if (search) params.search = search;
      
      const response = await axios.get('/api/admin/all-products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, search, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      const response = await axios.delete(`/api/products/${productId}`);
      
      if (response.data.success) {
        toast.success('Product deleted');
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeature = async (productId: string, isFeatured: boolean) => {
    try {
      const response = await axios.put(`/api/admin/toggle-feature`, {
        productId,
        isFeatured: !isFeatured
      });
      
      if (response.data.success) {
        toast.success(isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchProducts();
      }
    } catch (error: any) {
      toast.error('Failed to update');
    }
  };

  // ============ HELPERS ============
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ============ RENDER ============
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">{total} total products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Search
            </button>
          </form>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="digital">Digital Products</option>
            <option value="website">Website Templates</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-violet-600">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {product.productType === 'website' ? (
                        <Globe className="w-10 h-10 text-white/50" />
                      ) : (
                        <Package className="w-10 h-10 text-white/50" />
                      )}
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(product.status)}
                  </div>
                  
                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                        ★ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    by {product.vendorId?.name || 'Unknown'}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span>{product.sales || 0} sales</span>
                    <span>{product.views || 0} views</span>
                  </div>
                  
                  {/* Price & Actions */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      ${product.price}
                    </span>
                    
                    <div className="flex gap-1">
                      <Link
                        href={`/digital-products/${product._id}`}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {product.demoUrl && (
                        <a
                          href={product.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleToggleFeature(product._id, product.isFeatured)}
                        className={`p-1.5 rounded ${
                          product.isFeatured
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-yellow-400' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      page === i + 1
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{selectedProduct.title}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedProduct._id)}
                disabled={deletingId === selectedProduct._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === selectedProduct._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}