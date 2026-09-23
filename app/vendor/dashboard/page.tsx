'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Eye,
  Clock
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/products/my-products', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5 }
        });
        
        if (response.data.success) {
          setRecentProducts(response.data.data.products);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // Update stats from user data
  useEffect(() => {
    if (user) {
      setStats({
        totalProducts: user.totalProducts || 0,
        activeProducts: user.activeProducts || 0,
        pendingProducts: user.pendingProducts || 0,
        totalSales: user.totalSales || 0,
        totalEarnings: user.totalEarnings || 0,
        pendingEarnings: user.pendingEarnings || 0
      });
    }
  }, [user]);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Products', value: stats.activeProducts, icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'Total Sales', value: stats.totalSales, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Earnings', value: `$${stats.totalEarnings}`, icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Ready to sell more?</h3>
          <p className="text-white/80 mb-4">Upload a new product to your store</p>
          <Link
            href="/vendor/products/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            <Plus className="w-5 h-5" />
            Upload Product
          </Link>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
          <p className="text-gray-600 mb-4">
            You have {stats.pendingProducts} products waiting for review
          </p>
          <Link
            href="/vendor/products?status=pending"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <Clock className="w-5 h-5" />
            View Pending
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.price}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.status === 'approved' ? 'bg-green-100 text-green-700' :
                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No products yet</p>
          </div>
        )}
      </div>
    </div>
  );
}