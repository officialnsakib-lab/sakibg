'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  Package,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  productId: string; // প্রডাক্ট আইডি যুক্ত করা হলো যাতে সঠিক প্রডাক্ট পেজে যাওয়া যায়
  productTitle: string;
  productType: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  vendorAmount: number;
  paymentStatus: string;
  orderStatus: string;
  downloadToken: string;
  downloadCount: number;
  vendorName: string;
  createdAt: string;
}

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/my-orders', {
        params: { page, limit: 10 }
      });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotal(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'refunded':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Refunded</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-xl shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
          <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold">
            Login to View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">{total} total orders</p>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{order.productTitle}</h3>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Order ID: <span className="font-mono">{order.orderId}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      by {order.vendorName} • {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">${order.price}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Commission: ${order.commissionAmount} ({order.commissionRate}%)
                    </p>
                    
                    <div className="flex gap-2 justify-end">
                      {order.downloadToken && order.orderStatus === 'completed' && (
                        <Link
                          href={`/download/${order.downloadToken}`}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Link>
                      )}
                      
                      {/* এখানে order._id এর পরিবর্তে order.productId ব্যবহার করা হয়েছে যাতে 404 ইরর না আসে */}
                      <Link
                        href={`/digital-products/${order.productId}`}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/digital-products" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold">
              Browse Products
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  page === i + 1
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}