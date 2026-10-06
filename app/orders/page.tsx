'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  CheckCheck
} from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productType: string;
  price: number;
  paymentStatus: string;
  orderStatus: string; // 'pending' | 'confirmed' | 'shipping' | 'delivered'
  vendorName: string;
  createdAt: string;
}

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
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

  // স্ট্যাটাস অনুযায়ী সঠিক ব্যাজ দেখানোর লজিক
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'shipping':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-bold rounded-full">
            <Truck className="w-3.5 h-3.5" /> Shipping
          </span>
        );
      case 'delivered':
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold rounded-full">
            <CheckCheck className="w-3.5 h-3.5" /> Received
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium capitalize">
            {status || 'Pending'}
          </span>
        );
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
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base">{order.productTitle || 'Physical Product'}</h3>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Order ID: <span className="font-mono font-medium text-gray-700">{order.orderId}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Seller: <span className="text-gray-700 font-medium">{order.vendorName || 'Store Vendor'}</span> • {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right flex flex-col justify-between items-end">
                    <div>
                      {/* কারেন্সি ফরম্যাটার ব্যবহার করা হলো যাতে ড্রপডাউন বদলালে দাম বদলায় */}
                      <p className="text-xl font-extrabold text-indigo-600">{formatPrice(order.price)}</p>
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-4">
                      <Link
                        href={`/physical-products/${order.productId}`}
                        className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
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
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Start shopping to see your physical and food orders here</p>
            <Link href="/physical-products" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">
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
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium ${
                  page === i + 1
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 bg-white"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}