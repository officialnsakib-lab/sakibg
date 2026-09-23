'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  X, 
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Globe,
  Star,
  Calendar,
  Eye,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Tag,
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react';

interface PendingProduct {
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
  fileUrl: string;
  fileSize: string;
  version: string;
  tags: string[];
  vendorId: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    totalProducts: number;
    totalSales: number;
    averageRating: number;
  };
  createdAt: string;
}

export default function AdminApprovalsProductsPage() {
  // ============ STATE ============
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'digital' | 'website'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ============ FETCH ============
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        type: filterType,
        sort: sortOrder,
      };
      
      if (search) params.search = search;
      if (dateFilter !== 'all') params.date = dateFilter;
      
      const response = await axios.get('/api/admin/pending-products', { params });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  }, [filterType, search, dateFilter, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleApprove = async (productId: string) => {
    setProcessingId(productId);
    try {
      const response = await axios.put('/api/admin/approve-product', {
        productId,
        action: 'approve'
      });
      
      if (response.data.success) {
        toast.success('Product approved!');
        fetchProducts();
        setShowPreview(false);
        setSelectedProduct(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }
    
    setProcessingId(selectedProduct._id);
    try {
      const response = await axios.put('/api/admin/approve-product', {
        productId: selectedProduct._id,
        action: 'reject',
        reason: rejectReason.trim()
      });
      
      if (response.data.success) {
        toast.success('Product rejected');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // ============ RENDER ============
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500 mt-1">{total} products waiting for review</p>
        </div>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm">
              Search
            </button>
          </form>

          {/* Type Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'digital', label: 'Digital' },
              { value: 'website', label: 'Websites' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => { setFilterType(item.value as any); setPage(1); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === item.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Date */}
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value as any); setPage(1); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Vendor</div>
            <div className="col-span-2">Details</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product._id} className="lg:grid lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {/* Product Info */}
                <div className="lg:col-span-4 flex gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-white/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => { setSelectedProduct(product); setShowPreview(true); }}
                      className="font-medium text-gray-900 hover:text-red-600 truncate block w-full text-left"
                    >
                      {product.title}
                    </button>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        product.productType === 'website' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.productType === 'website' ? 'Website' : 'Digital'}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                    </div>
                  </div>
                </div>

                {/* Vendor */}
                <div className="lg:col-span-2 flex items-center gap-2 mt-3 lg:mt-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {product.vendorId?.name?.charAt(0) || 'V'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.vendorId?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{product.vendorId?.email}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 mt-2 lg:mt-0">
                  <p className="text-sm font-semibold text-gray-900">${product.price}</p>
                  <p className="text-xs text-gray-500">v{product.version || '1.0.0'}</p>
                </div>

                {/* Date */}
                <div className="lg:col-span-2 mt-2 lg:mt-0">
                  <p className="text-sm text-gray-900">{formatDate(product.createdAt)}</p>
                  <p className="text-xs text-gray-400">{getTimeAgo(product.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex lg:justify-end gap-2 mt-3 lg:mt-0">
                  <button
                    onClick={() => { setSelectedProduct(product); setShowPreview(true); }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {product.demoUrl && (
                    <a
                      href={product.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <button
                    onClick={() => handleApprove(product._id)}
                    disabled={processingId === product._id}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    title="Approve"
                  >
                    {processingId === product._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => { setSelectedProduct(product); setShowRejectModal(true); }}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No pending products to review</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  page === i + 1 ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="h-56 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg overflow-hidden">
                {selectedProduct.thumbnailUrl ? (
                  <img src={selectedProduct.thumbnailUrl} alt={selectedProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h3>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{selectedProduct.productType}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">{selectedProduct.category}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">${selectedProduct.price}</span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 whitespace-pre-line text-sm">{selectedProduct.description}</p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedProduct.vendorId?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedProduct.vendorId?.name}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.vendorId?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => { setShowPreview(false); handleApprove(selectedProduct._id); }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Approve
              </button>
              <button
                onClick={() => { setShowPreview(false); setShowRejectModal(true); }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Product</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Rejecting: <span className="font-medium">{selectedProduct.title}</span>
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Why are you rejecting this product?"
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedProduct._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {processingId === selectedProduct._id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}