'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Calendar,
  Award,
  Ban,
  Check,
  Clock
} from 'lucide-react';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  vendorType: string;
  isApprovedVendor: boolean;
  commissionRate: number;
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalSales: number;
  totalEarnings: number;
  pendingEarnings: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function AdminVendorsPage() {
  // ============ STATE ============
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'banned'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'sales' | 'earnings' | 'rating'>('newest');
  
  // Modal state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ============ FETCH VENDORS ============
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        status: filterStatus,
        sort: sortOrder,
      };
      
      if (search) params.search = search;
      
      const response = await axios.get('/api/admin/vendors', { params });
      
      if (response.data.success) {
        setVendors(response.data.data.vendors);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, sortOrder, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // ============ HANDLERS ============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleApproveVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    try {
      const response = await axios.put('/api/admin/approve-vendor', {
        vendorId,
        action: 'approve'
      });
      
      if (response.data.success) {
        toast.success('Vendor approved');
        fetchVendors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBanVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    try {
      const response = await axios.put('/api/admin/approve-vendor', {
        vendorId,
        action: 'ban'
      });
      
      if (response.data.success) {
        toast.success('Vendor banned');
        fetchVendors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to ban');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnbanVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    try {
      const response = await axios.put('/api/admin/approve-vendor', {
        vendorId,
        action: 'unban'
      });
      
      if (response.data.success) {
        toast.success('Vendor unbanned');
        fetchVendors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to unban');
    } finally {
      setProcessingId(null);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.isBanned) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Banned</span>;
    }
    if (vendor.isApprovedVendor) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Approved</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
  };

  // ============ RENDER ============
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-gray-500 mt-1">{total} registered vendors</p>
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
                placeholder="Search by name or email..."
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

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="all">All Vendors</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
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
            <option value="sales">Top Sales</option>
            <option value="earnings">Top Earnings</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading vendors...</p>
        </div>
      ) : vendors.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-3">Vendor</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-2">Earnings</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <div key={vendor._id} className="lg:grid lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {/* Vendor Info */}
                <div className="lg:col-span-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {vendor.name?.charAt(0) || 'V'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {vendor.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined {formatDate(vendor.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">{vendor.totalProducts} products</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{vendor.totalSales} sales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-700">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="lg:col-span-2">
                  <p className="text-lg font-bold text-gray-900">
                    ${vendor.totalEarnings || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${vendor.pendingEarnings || 0} pending
                  </p>
                  <p className="text-xs text-gray-400">
                    {vendor.commissionRate}% commission
                  </p>
                </div>

                {/* Status */}
                <div className="lg:col-span-2 flex items-center">
                  {getStatusBadge(vendor)}
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex lg:justify-end gap-2 mt-3 lg:mt-0">
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowVendorModal(true);
                    }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {!vendor.isApprovedVendor && !vendor.isBanned && (
                    <button
                      onClick={() => handleApproveVendor(vendor._id)}
                      disabled={processingId === vendor._id}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      title="Approve"
                    >
                      {processingId === vendor._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  {!vendor.isBanned ? (
                    <button
                      onClick={() => handleBanVendor(vendor._id)}
                      disabled={processingId === vendor._id}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      title="Ban"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnbanVendor(vendor._id)}
                      disabled={processingId === vendor._id}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                      title="Unban"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vendors Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
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

      {/* Vendor Details Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              <button
                onClick={() => setShowVendorModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedVendor.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedVendor.name}</h3>
                  <p className="text-sm text-gray-500">{selectedVendor.email}</p>
                  {getStatusBadge(selectedVendor)}
                </div>
              </div>

              {/* Bio */}
              {selectedVendor.bio && (
                <p className="text-gray-600 text-sm">{selectedVendor.bio}</p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVendor.totalProducts}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Active Products</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVendor.activeProducts}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVendor.totalSales}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-lg font-bold text-gray-900">${selectedVendor.totalEarnings}</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-gray-900">★ {selectedVendor.averageRating?.toFixed(1)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVendor.commissionRate}%</p>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Joined: {formatDate(selectedVendor.createdAt)}
                </p>
                {selectedVendor.lastLogin && (
                  <p className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    Last Login: {formatDate(selectedVendor.lastLogin)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}