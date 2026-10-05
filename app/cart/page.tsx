'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext'; // ১. কারেন্সি হুক ইমপোর্ট করা হলো
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { formatPrice } = useCurrency(); // ২. কারেন্সি ফরম্যাটার কল করা হলো
  const router = useRouter();

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#070b12] text-white">
        <div className="bg-amber-500/10 p-6 rounded-full mb-4 border border-amber-500/20">
          <ShoppingCart className="w-12 h-12 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty!</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md text-sm">
          There are no items in your shopping cart. Explore our shop to add your favorite products and food items.
        </p>
        <Link 
          href="/physical-products" 
          className="bg-amber-400 text-neutral-950 px-6 py-3 rounded-xl font-semibold hover:bg-amber-500 transition-colors shadow-md"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 text-white">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-amber-400" />
        <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart ({cart.length} items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const itemId = item.productId || item._id || item.id;
            const rawPrice = item.salePrice ?? item.price ?? 0;
            const itemPrice = typeof rawPrice === 'object' ? Number(rawPrice.$numberDecimal || 0) : Number(rawPrice) || 0;
            const itemQuantity = Number(item.quantity) || 1;

            return (
              <div 
                key={itemId} 
                className="flex flex-col sm:flex-row items-center justify-between bg-[#0c121d] border border-amber-500/20 p-4 rounded-xl shadow-sm gap-4 transition-all hover:border-amber-500/40"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img 
                    src={item.image || item.thumbnailUrl || '/placeholder.png'} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-800 flex-shrink-0" 
                  />
                  <div>
                    <h3 className="font-semibold text-white text-base line-clamp-1">{item.title}</h3>
                    {/* ৩. স্ট্যাটিক সাইন পরিবর্তন করে ডাইনামিক formatPrice ব্যবহার করা হলো */}
                    <p className="text-amber-400 font-bold mt-1">{formatPrice(itemPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-amber-500/30 rounded-lg overflow-hidden bg-neutral-900">
                    <button
                      onClick={() => updateQuantity(itemId, itemQuantity - 1)}
                      className="p-2 hover:bg-amber-500/20 text-amber-300 transition-colors"
                      disabled={itemQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-semibold text-white text-sm">{itemQuantity}</span>
                    <button
                      onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                      className="p-2 hover:bg-amber-500/20 text-amber-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <Link href="/physical-products" className="text-sm font-medium text-amber-400 hover:underline">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-red-400 font-medium hover:text-red-300 flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#0c121d] border border-amber-500/20 p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-3">Order Summary</h3>
          
          <div className="flex justify-between text-gray-300 text-sm">
            <span>Total Products Price</span>
            <span className="font-semibold text-white">{formatPrice(totalAmount || 0)}</span>
          </div>

          <div className="flex justify-between text-gray-300 text-sm">
            <span>Shipping Charge</span>
            <span className="text-gray-400 italic">Determined at checkout</span>
          </div>

          <hr className="border-gray-800" />

          <div className="flex justify-between text-lg font-extrabold text-white">
            <span>Subtotal</span>
            <span className="text-amber-400">{formatPrice(totalAmount || 0)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-amber-400 text-neutral-950 py-3.5 rounded-xl hover:bg-amber-500 font-bold transition-all shadow-lg cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}