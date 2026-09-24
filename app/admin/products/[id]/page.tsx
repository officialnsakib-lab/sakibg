'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart, ShoppingBag, Package, Star, ShieldCheck, Truck } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const productData = data.success ? data.data : data;
          setProduct({
            ...productData,
            price: Number(productData.price) || 0,
            salePrice: productData.salePrice ? Number(productData.salePrice) : null,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-24 text-slate-400 font-medium text-lg">লোড হচ্ছে...</div>;
  }

  if (!product) {
    return <div className="text-center py-24 text-slate-400 font-medium text-lg">প্রোডাক্টটি পাওয়া যায়নি</div>;
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('কার্টে যোগ করা হয়েছে!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('দয়া করে প্রথমে লগইন করুন');
      router.push(`/login?redirect=/checkout/${product._id}`);
      return;
    }
    addToCart(product);
    router.push(`/checkout/${product._id}`);
  };

  const displayPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="bg-slate-100 rounded-xl overflow-hidden h-[420px] flex items-center justify-center">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-20 h-20 text-slate-400" />
          )}
        </div>
        
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category || 'Physical Product'}
            </span>
            <h1 className="text-3xl font-extrabold mt-3 mb-4 text-slate-900 leading-tight">{product.title}</h1>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-indigo-600">৳{displayPrice}</span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-lg text-slate-400 line-through font-medium">৳{product.price}</span>
              )}
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">{product.description || 'এই প্রোডাক্টটির জন্য কোনো বিবরণ দেওয়া হয়নি।'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-5 h-5" /> কার্টে রাখুন
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
              >
                <ShoppingBag className="w-5 h-5" /> এখনই কিনুন
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>১০০% নিরাপদ ট্রানজাকশন</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}