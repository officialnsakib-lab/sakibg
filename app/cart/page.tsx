'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        আপনার কার্টটি খালি রয়েছে!
        <div className="mt-4">
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      ইনভেন্টরি কার্ট
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* কার্ট আইটেম লিস্ট */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  রিমুভ
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            কার্ট খালি করুন
          </button>
        </div>

        {/* অর্ডার সামারি */}
        <div className="border p-6 rounded-lg shadow-sm h-fit bg-gray-50">
          <h3 className="text-xl font-bold mb-4">অর্ডার সামারি</h3>
          <div className="flex justify-between mb-2">
            <span>মোট পণ্যের দাম</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>শিপিং</span>
            <span>গণনা করা হবে</span>
          </div>
          <hr className="mb-4" />
          <div className="flex justify-between text-lg font-bold mb-6">
            <span>সর্বমোট</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            চেকআউটে যান
          </Link>
        </div>
      </div>
    </div>
  );
}