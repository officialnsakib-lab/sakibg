// app/admin/orders/[id]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Package, User, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // অর্ডার ডিটেইলস ফেচ করার জন্য
  const fetchOrderDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // অর্ডারের স্ট্যাটাস আপডেট করার ফাংশন
  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await axios.put(`/api/orders/${id}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        toast.success('Order status updated successfully!');
        fetchOrderDetails(); // ডেটা রিফ্রেশ করুন
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Package className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-white bg-gray-900 min-h-screen">
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Order Details: <span className="text-indigo-400 font-mono">{order.orderId}</span>
        </h1>
        <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-300 w-fit">
          Status: {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* প্রডাক্ট ইনফো */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" /> Product Info
          </h2>
          <p className="mb-2"><strong>Title:</strong> {order.productTitle}</p>
          <p className="mb-2"><strong>Type:</strong> <span className="uppercase bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-xs">{order.productType}</span></p>
          <p className="mb-2"><strong>Price:</strong> ${order.price} {order.currency || 'USD'}</p>
          <p className="mb-2"><strong>Payment Method:</strong> {order.paymentMethod || 'Online'}</p>
          <p className="mb-2"><strong>Payment Status:</strong> <span className="text-yellow-400 font-semibold uppercase">{order.paymentStatus}</span></p>
        </div>

        {/* শিপিং ও কাস্টমার ইনফো */}
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Shipping & Customer Info
          </h2>
          <p className="mb-2"><strong>Buyer Name:</strong> {order.buyerName || order.userName}</p>
          <p className="mb-2"><strong>Email:</strong> {order.buyerEmail || order.userEmail}</p>
          {order.shippingAddress ? (
            <div className="mt-3 bg-gray-900 p-3 rounded-lg border border-gray-800">
              <p className="text-sm text-gray-300"><strong>Address:</strong> {order.shippingAddress.address || order.shippingAddress}</p>
              <p className="text-sm text-gray-300 mt-1"><strong>Phone:</strong> {order.shippingAddress.phone || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic mt-3 bg-gray-900 p-3 rounded-lg border border-gray-800">
              Digital product / No shipping address required
            </p>
          )}
        </div>
      </div>

      {/* প্যাকিং, শিপিং বা স্ট্যাটাস ম্যানেজমেন্ট */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-400" /> Manage Order Status & Tracking
        </h2>
        <p className="mb-4 text-sm text-gray-300">
          Current Status: <span className="uppercase font-bold text-green-400">{order.orderStatus}</span>
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            disabled={updating}
            onClick={() => handleStatusUpdate('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${order.orderStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
          >
            Pending
          </button>
          <button 
            disabled={updating}
            onClick={() => handleStatusUpdate('processing')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${order.orderStatus === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
          >
            📦 Packing / Processing
          </button>
          <button 
            disabled={updating}
            onClick={() => handleStatusUpdate('shipped')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${order.orderStatus === 'shipped' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
          >
            🚚 Shipped
          </button>
          <button 
            disabled={updating}
            onClick={() => handleStatusUpdate('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${order.orderStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
          >
            ✅ Received / Completed
          </button>
          <button 
            disabled={updating}
            onClick={() => handleStatusUpdate('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${order.orderStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}