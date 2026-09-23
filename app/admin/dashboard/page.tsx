'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Package, 
  Globe,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [topVendors, setTopVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setStats(response.data.data.stats);
          setRecentProducts(response.data.data.recentProducts);
          setTopVendors(response.data.data.topVendors);
        }
      } catch (error: any) {
        console.error('Stats error:', error);
        toast.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Vendors', value: stats?.totalVendors || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-green-50 text-green-600' },
    { label: 'Website Demos', value: stats?.totalWebsiteDemos || 0, icon: Globe, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Pending Approvals', value: stats?.pendingProducts || 0, icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/approvals"
          className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-xl"
        >
          <Clock className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">Pending Approvals</h3>
          <p className="text-white/80 text-sm">{stats?.pendingProducts || 0} products waiting</p>
        </Link>
        
        <Link
          href="/admin/products"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl"
        >
          <Package className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">Manage Products</h3>
          <p className="text-white/80 text-sm">{stats?.approvedProducts || 0} approved products</p>
        </Link>
        
        <Link
          href="/admin/vendors"
          className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">Vendors</h3>
          <p className="text-white/80 text-sm">{stats?.totalVendors || 0} registered vendors</p>
        </Link>
      </div>

      {/* Recent Pending Products */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Pending Products</h3>
        </div>
        {recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{product.title}</p>
                  <p className="text-sm text-gray-500">
                    by {product.vendorId?.name} • {product.productType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Pending
                  </span>
                  <Link
                    href="/admin/approvals"
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No pending products
          </div>
        )}
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Vendors</h3>
        </div>
        {topVendors.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {topVendors.map((vendor) => (
              <div key={vendor._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                    {vendor.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{vendor.totalSales} sales</p>
                  <p className="text-sm text-gray-500">${vendor.totalEarnings} earned</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No vendors yet
          </div>
        )}
      </div>
    </div>
  );
}