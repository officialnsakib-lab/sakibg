'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext'; // ✅ গ্লোবাল AuthContext ইমপোর্ট করা হলো

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // ✅ গ্লোবাল স্টেট থেকে ইউজার নেওয়া হলো
  const [loading, setLoading] = useState(true);

  const userId = user?._id || user?.id || null;

  // উইশলিস্টের ডাটা লোড করা
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`/api/wishlist?userId=${userId}`);
      
      // ব্যাকএন্ডের রেসপন্স ফরম্যাট যাই হোক না কেন তা হ্যান্ডেল করার জন্য
      const items = res.data.data || res.data.wishlist || res.data;
      if (res.data.success || Array.isArray(items)) {
        setWishlist(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      if (userId) {
        fetchWishlist();
      } else {
        setLoading(false);
        toast.error('Please login to view wishlist');
      }
    }
  }, [userId, authLoading, fetchWishlist]);

  // উইশলিস্ট থেকে প্রডাক্ট রিমুভ করা
  const handleRemove = async (id: string) => {
    try {
      const res = await axios.delete(`/api/wishlist?id=${id}`);
      if (res.data.success) {
        toast.success('Removed from wishlist');
        setWishlist(wishlist.filter(item => item._id !== id));
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Your wishlist is empty!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.productId || item;
            if (!product) return null;
            return (
              <div key={item._id} className="bg-white border rounded-xl p-4 shadow-sm relative flex flex-col justify-between">
                <div>
                  <img src={product.image || '/placeholder.png'} alt={product.title || product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{product.title || product.name}</h3>
                  <p className="text-red-600 font-bold mt-1">৳{product.price}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                  <button 
                    onClick={() => toast.success('Added to Cart!')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}