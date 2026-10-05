'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  const userId = user?._id || user?.id || null;

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`/api/wishlist?userId=${userId}`);
      const items = res.data.data?.items || res.data.data || res.data.wishlist || res.data;
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
      }
    }
  }, [userId, authLoading, fetchWishlist]);

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
      <div className="flex justify-center items-center min-h-[60vh] bg-[#070b12]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-amber-400">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">Your wishlist is empty!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const product = item.productId || item.product || item;
            if (!product) return null;
            
            // সঠিক প্রাইজ ক্যালকুলেশন (salePrice প্রাধান্য পাবে, না থাকলে price)
            const rawPrice = product.salePrice ?? product.price ?? 0;
            const productPrice = typeof rawPrice === 'object' ? (rawPrice.$numberDecimal || 0) : Number(rawPrice) || 0;

            const thumbnail = product.thumbnailUrl || product.image || '/placeholder.png';
            const title = product.title || product.name || 'Product Title';

            return (
              <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative flex flex-col justify-between">
                <div>
                  <img 
                    src={thumbnail} 
                    alt={title} 
                    className="w-full h-44 object-cover rounded-lg mb-3 bg-slate-800" 
                  />
                  <h3 className="font-semibold text-slate-100 line-clamp-1 text-base">{title}</h3>
                  <p className="text-amber-400 font-extrabold mt-1 text-lg">
                    {formatPrice(productPrice)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" /> Remove
                  </button>
                  <button 
                    onClick={() => {
                      addToCart(product);
                      toast.success('Added to Cart!');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold rounded-lg text-sm transition shadow-sm"
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