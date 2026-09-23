'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Smartphone
} from 'lucide-react';

interface Order {
  _id: string;
  orderId: string;
  productTitle: string;
  productType: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  vendorAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string;
  senderNumber: string;
  orderStatus: string;
  buyerName: string;
  buyerEmail: string;
  createdAt: string;
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders/vendor-orders', {
        params: { page, limit: 10 }
      });
      
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalRevenue(response.data.data.totalRevenue);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalOrders(response.data.data.pagination.total);
      }
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Paid</span>;
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
      day: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <ShoppingCart className="w-8 h-8 text-indigo-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <DollarSign className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.paymentStatus === 'pending').length}
          </p>
          <p className="text-sm text-gray-500">Pending Verification</p>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Commission</th>
                <th className="px-5 py-3">Your Earnings</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{order.productTitle}</p>
                    <p className="text-xs text-gray-500">{order.orderId}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-900">{order.buyerName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {order.buyerEmail}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    ${order.price}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    ${order.commissionAmount} ({order.commissionRate}%)
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-green-600">
                    ${order.vendorAmount}
                  </td>
                  <td className="px-5 py-3">
                    {getStatusBadge(order.paymentStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Orders Yet</h3>
          <p className="text-gray-500">Your sales will appear here</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
  );
}