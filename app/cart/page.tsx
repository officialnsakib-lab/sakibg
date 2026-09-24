'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty!</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          There are no items in your shopping cart. Add your favorite products from our collection.
        </p>
        <Link 
          href="/" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Cart ({cart.length} items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const itemId = item.productId || item._id || item.id;
            const itemPrice = item.salePrice || item.price || 0;
            const itemQuantity = Number(item.quantity) || 1;

            return (
              <div 
                key={itemId} 
                className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm gap-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img 
                    src={item.image || item.thumbnailUrl || '/placeholder.png'} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" 
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{item.title}</h3>
                    <p className="text-indigo-600 font-bold mt-1">${itemPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(itemId, itemQuantity - 1)}
                      className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                      disabled={itemQuantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-semibold text-gray-800 text-sm">{itemQuantity}</span>
                    <button
                      onClick={() => updateQuantity(itemId, itemQuantity + 1)}
                      className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-sm font-medium"
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
            <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 font-medium hover:text-red-800 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-3">Order Summary</h3>
          
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Total Products Price</span>
            <span className="font-semibold text-gray-800">${(totalAmount || 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600 text-sm">
            <span>Shipping Charge</span>
            <span className="text-gray-500 italic">Determined at checkout</span>
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-between text-lg font-extrabold text-gray-900">
            <span>Subtotal</span>
            <span className="text-indigo-600">${(totalAmount || 0).toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleProceedToCheckout}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-100 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}