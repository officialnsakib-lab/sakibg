'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Settings,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface VendorCommission {
  _id: string;
  name: string;
  email: string;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  pendingEarnings: number;
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  joinedDate: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalCommission: number;
  totalVendorEarnings: number;
  totalOrders: number;
  totalProducts: number;
  totalVendors: number;
  totalCustomers: number;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
    commission: number;
    newVendors: number;
    newCustomers: number;
    newProducts: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export default function AdminCommissionPage() {
  // ============ STATE ============
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [vendors, setVendors] = useState<VendorCommission[]>([]);
  
  // Commission settings
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [selectedVendor, setSelectedVendor] = useState<VendorCommission | null>(null);
  const [newCommission, setNewCommission] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Date filter
const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year' | 'all' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // ============ FETCH DATA ============
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        range: dateRange,
      };
      
      if (dateRange === 'custom') {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }
      
      const response = await axios.get('/api/admin/analytics', { params });
      
      if (response.data.success) {
        setAnalytics(response.data.data.analytics);
      }
    } catch (error: any) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/commission', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        setVendors(response.data.data.vendors);
        setDefaultCommission(response.data.data.defaultCommission);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Vendors error:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'analytics') {
      fetchAnalytics();
    }
    if (activeTab === 'overview' || activeTab === 'vendors') {
      fetchVendors();
    }
  }, [activeTab, fetchAnalytics, fetchVendors]);

  // ============ HANDLERS ============
  const handleUpdateCommission = async (vendorId: string, rate: number) => {
    setUpdatingId(vendorId);
    try {
      const response = await axios.put('/api/admin/commission', {
        vendorId,
        commissionRate: rate
      });
      
      if (response.data.success) {
        toast.success('Commission updated');
        fetchVendors();
        setSelectedVendor(null);
        setNewCommission('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateDefault = async () => {
    try {
      const response = await axios.put('/api/admin/commission', {
        defaultCommission: defaultCommission
      });
      
      if (response.data.success) {
        toast.success('Default commission updated');
      }
    } catch (error: any) {
      toast.error('Failed to update');
    }
  };

  // ============ HELPERS ============
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ============ RENDER ============
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission & Analytics</h1>
        <p className="text-gray-500 mt-1">Manage commission rates and view analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'vendors'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Vendor Commissions
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'analytics'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: 'year', label: 'This Year' },
              { value: 'all', label: 'All Time' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setDateRange(item.value as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === item.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
// Date filter state - এভাবে change করুন
            const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year' | 'all' | 'custom'>('30days');
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
            // Date filter state - এভাবে change করুন
            const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year' | 'all' | 'custom'>('30days');
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Your Commission</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.totalCommission)}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total Vendors</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalVendors}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total Products</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalProducts}
                  </p>
                </div>
              </div>

              {/* Daily Stats Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Daily Statistics</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Orders</th>
                        <th className="px-5 py-3">Revenue</th>
                        <th className="px-5 py-3">Commission</th>
                        <th className="px-5 py-3">New Vendors</th>
                        <th className="px-5 py-3">New Customers</th>
                        <th className="px-5 py-3">New Products</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.dailyStats.map((day, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">
                            {formatDate(day.date)}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{day.orders}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{formatCurrency(day.revenue)}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{formatCurrency(day.commission)}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{day.newVendors}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{day.newCustomers}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{day.newProducts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ VENDORS TAB ============ */}
          {activeTab === 'vendors' && (
            <div className="space-y-6">
              {/* Default Commission */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Default Commission Rate</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={defaultCommission}
                    onChange={(e) => setDefaultCommission(parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-32"
                  />
                  <span className="text-gray-500">%</span>
                  <button
                    onClick={handleUpdateDefault}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Update Default
                  </button>
                </div>
              </div>

              {/* Vendors Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-5 py-3">Vendor</th>
                        <th className="px-5 py-3">Products</th>
                        <th className="px-5 py-3">Sales</th>
                        <th className="px-5 py-3">Earnings</th>
                        <th className="px-5 py-3">Commission %</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendors.map((vendor) => (
                        <tr key={vendor._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900">{vendor.name}</p>
                            <p className="text-xs text-gray-500">{vendor.email}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{vendor.totalProducts}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{vendor.totalSales}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">
                            {formatCurrency(vendor.totalEarnings)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded">
                              {vendor.commissionRate}%
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setNewCommission(vendor.commissionRate.toString());
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ ANALYTICS TAB ============ */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Category Stats */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Category Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Products</th>
                        <th className="px-5 py-3">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.categoryStats.map((cat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">{cat.category}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{cat.count}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{formatCurrency(cat.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Commission Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Commission</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vendor: <span className="font-medium">{selectedVendor.name}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedVendor(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateCommission(selectedVendor._id, parseFloat(newCommission))}
                disabled={updatingId === selectedVendor._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {updatingId === selectedVendor._id ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}