'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  Package,
  Shield,
  Zap,
  CheckCircle,
  User,
  Mail,
  Lock,
  Smartphone,
  CreditCard,
  Info,
  Copy,
  Check,
  Truck,
  MapPin
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Shipping Address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
  });

  // Demo payment info for Mobile Banking
  const paymentInfo = {
    bkash: {
      number: '01800000000',
      accountType: 'Merchant',
      accountName: 'Wahisnova',
    },
    nagad: {
      number: '01800000000',
      accountType: 'Merchant',
      accountName: 'Wahisnova',
    }
  };

  // Handle Input Change for Shipping
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  // Copy number
  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    toast.success('Number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate Shipping Address
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^01[0-9]{9}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = 'Enter valid 11-digit phone number';
    }
    if (!shippingAddress.address.trim()) newErrors.address = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';

    // Validate Payment if not COD
    if (paymentMethod !== 'cod') {
      if (!transactionId.trim()) {
        newErrors.transactionId = 'Transaction ID required';
      } else if (transactionId.length < 8) {
        newErrors.transactionId = 'Enter valid transaction ID';
      }
      
      if (!senderNumber.trim()) {
        newErrors.senderNumber = 'Your bKash/Nagad number required';
      } else if (!/^01[0-9]{9}$/.test(senderNumber.trim())) {
        newErrors.senderNumber = 'Enter valid 11-digit number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle purchase
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post('/api/orders/create', {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.salePrice || item.price,
          vendor: item.vendor
        })),
        shippingAddress,
        totalAmount,
        paymentMethod,
        transactionId: paymentMethod !== 'cod' ? transactionId.trim() : undefined,
        senderNumber: paymentMethod !== 'cod' ? senderNumber.trim() : undefined
      });

      if (response.data.success) {
        setOrderId(response.data.data.order.orderId);
        setOrderComplete(true);
        clearCart();
        toast.success('Order placed successfully!');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Order complete view
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">Thank you for your purchase. We are processing your order.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="font-semibold text-gray-900 uppercase">{paymentMethod}</p>
              </div>
              {paymentMethod !== 'cod' && (
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{transactionId}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/orders"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

        <form onSubmit={handlePurchase} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left 2 Columns: Shipping & Payment Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Address Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" /> Shipping Address
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="House/Apartment, Area, Road"
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="City/District"
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Select Payment Method
              </h2>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-bold text-pink-600">bKash</div>
                  <p className="text-xs text-gray-500">Send Money</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-bold text-orange-600">Nagad</div>
                  <p className="text-xs text-gray-500">Send Money</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-bold text-indigo-600">COD</div>
                  <p className="text-xs text-gray-500">Cash on Delivery</p>
                </button>
              </div>

              {/* bKash / Nagad Instruction */}
              {paymentMethod !== 'cod' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Step 1: Send ${totalAmount.toFixed(2)} to our {paymentMethod} merchant number
                    </p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <span className="font-mono font-semibold text-gray-900">
                        {paymentInfo[paymentMethod].number}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyNumber(paymentInfo[paymentMethod].number)}
                        className="p-1 text-gray-400 hover:text-indigo-600 flex items-center gap-1 text-sm"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Step 2: Enter Transaction ID *</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.transactionId ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g. 9HJ8KLMN3P"
                    />
                    {errors.transactionId && <p className="text-xs text-red-500 mt-1">{errors.transactionId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Step 3: Your {paymentMethod} Number *</label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${errors.senderNumber ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="01XXXXXXXXX"
                    />
                    {errors.senderNumber && <p className="text-xs text-red-500 mt-1">{errors.senderNumber}</p>}
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 p-4 rounded-lg text-indigo-700 text-sm">
                  You can pay in cash to the delivery person upon receiving your ordered products.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary & Confirm Button */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-gray-900">${((item.salePrice || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || cart.length === 0}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  `Place Order - $${totalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}