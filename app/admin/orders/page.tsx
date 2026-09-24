'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  TrendingUp,
  Trash2
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
  vendorName: string;
  vendorEmail: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    totalCommission: 0
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10, status: filterStatus };
      if (search) params.search = search;
      
      const response = await axios.get('/api/admin/orders', { params });
      
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        setTotal(response.data.data.pagination?.total || 0);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
        setStats(response.data.data.stats || {
          totalOrders: 0,
          pendingOrders: 0,
          paidOrders: 0,
          totalRevenue: 0,
          totalCommission: 0
        });
      }
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Approve payment
  const handleApprovePayment = async (orderId: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;
    
    setProcessingId(orderId);
    try {
      const response = await axios.patch('/api/admin/orders', {
        orderId,
        orderStatus: 'completed',
        paymentStatus: 'paid'
      });
      
      if (response.data.success) {
        toast.success('Payment approved successfully!');
        fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject payment
  const handleRejectPayment = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    setProcessingId(orderId);
    try {
      const response = await axios.patch('/api/admin/orders', {
        orderId,
        orderStatus: 'cancelled',
        paymentStatus: 'refunded'
      });
      
      if (response.data.success) {
        toast.success('Payment rejected');
        fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject payment');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('আপনি কি সত্যিই এই অর্ডারটি ডিলিট করতে চান?')) return;

    setProcessingId(orderId);
    try {
      const response = await axios.delete(`/api/orders/${orderId}`);
      
      if (response.data.success) {
        toast.success('Order deleted successfully!');
        fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete order');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Paid</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'refunded':
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Refunded</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <ShoppingCart className="w-6 h-6 text-indigo-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <Clock className="w-6 h-6 text-amber-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">{stats.paidOrders}</p>
          <p className="text-xs text-gray-500">Paid</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">৳{stats.totalRevenue}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-xl font-bold text-gray-900">৳{stats.totalCommission}</p>
          <p className="text-xs text-gray-500">Commission</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order ID, buyer, product..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
              Search
            </button>
          </form>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Commission</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 max-w-xs truncate">{order.productTitle || 'N/A'}</p>
                      <p className="text-xs text-gray-500 font-mono">#{order.orderId || order._id.slice(-6)}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.buyerName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.buyerEmail || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm uppercase font-semibold text-gray-900">{order.paymentMethod || 'Manual'}</p>
                      <p className="text-xs text-gray-500 font-mono">TrxID: {order.paymentId || 'N/A'}</p>
                      {order.senderNumber && (
                        <p className="text-xs text-gray-400">Sender: {order.senderNumber}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      ৳{order.price}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      ৳{order.commissionAmount || 0}
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 inline-flex items-center justify-center transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {order.paymentStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(order._id)}
                              disabled={processingId === order._id}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(order._id)}
                              disabled={processingId === order._id}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={processingId === order._id}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No Orders Found</h3>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                page === i + 1
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}