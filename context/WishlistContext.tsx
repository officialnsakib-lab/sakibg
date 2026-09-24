'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext'; // ✅ AuthContext ইমপোর্ট করা হলো

interface WishlistContextType {
  wishlist: any[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // ✅ AuthContext থেকে ইউজার নেওয়া হলো
  const [loading, setLoading] = useState(true);

  const userId = user?._id || user?.id || null;

  // ২. উইশলিস্ট ডাটা ফেচ করা
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`/api/wishlist?userId=${userId}`);
      console.log("Wishlist API Response:", res.data); // ডেটা স্ট্রাকচার চেক করার জন্য

      // ব্যাকএন্ডের রেসপন্স যেকোনো ফরম্যাটে আসুক না কেন তা সুরক্ষিতভাবে হ্যান্ডেল করা
      const items = res.data.data || res.data.wishlist || res.data;

      if (res.data.success || Array.isArray(items)) {
        setWishlist(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      console.error('Failed to load wishlist', error);
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

  // ৩. উইশলিস্টে প্রডাক্ট যোগ বা টগল করা
  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated || !userId) {
      toast.error('Please login first!');
      return;
    }
    try {
      const res = await axios.post('/api/wishlist', { userId, productId });
      if (res.data.success) {
        if (res.data.action === 'added') {
          toast.success('Added to wishlist!');
        } else {
          toast.success('Removed from wishlist!');
        }
        fetchWishlist(); // লিস্ট রিফ্রেশ করা
      }
    } catch (error) {
      toast.error('Something went wrong!');
    }
  };

  // ৪. উইশলিস্ট থেকে ডিলিট করা
  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const res = await axios.delete(`/api/wishlist?id=${wishlistId}`);
      if (res.data.success) {
        toast.success('Removed from wishlist');
        setWishlist(wishlist.filter(item => item._id !== wishlistId));
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // প্রডাক্টটি উইশলিস্টে আছে কি না চেক করার ফাংশন
  const isInWishlist = (productId: string) => {
    return wishlist.some(item => (item.productId?._id || item.productId) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}