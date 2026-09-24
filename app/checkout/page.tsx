'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  CheckCircle,
  Copy,
  Check,
  Truck,
  CreditCard,
  MapPin,
  DownloadCloud
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // URL Query Parameters
  const queryProductId = searchParams.get('id') || searchParams.get('productId');
  const queryType = searchParams.get('type');

  const [directProduct, setDirectProduct] = useState<any>(null);
  const [fetchingProduct, setFetchingProduct] = useState<boolean>(!!queryProductId);

  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
    deliveryArea: 'inside_dhaka',
  });

  // Fetch product if URL has productId
  useEffect(() => {
    if (queryProductId) {
      axios.get(`/api/products/${queryProductId}`)
        .then(res => {
          if (res.data?.product) {
            setDirectProduct(res.data.product);
          } else if (res.data?.data) {
            setDirectProduct(res.data.data);
          }
        })
        .catch(err => console.error('Fetch product error:', err))
        .finally(() => setFetchingProduct(false));
    }
  }, [queryProductId]);

  // Check if Digital product
  const isDigital = 
    queryType === 'digital' || 
    directProduct?.productType === 'digital' || 
    cart.some((item: any) => item.productType === 'digital');

  // Auto set user name
  useEffect(() => {
    if (user?.name && !shippingAddress.fullName) {
      setShippingAddress(prev => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  // Calculations
  const checkoutPrice = directProduct 
    ? (directProduct.salePrice || directProduct.price || 0) 
    : totalAmount;

  const deliveryCharge = isDigital ? 0 : (shippingAddress.deliveryArea === 'inside_dhaka' ? 60 : 120);
  const finalTotalAmount = checkoutPrice + deliveryCharge;

  const paymentInfo = {
    bkash: { number: '01800000000' },
    nagad: { number: '01800000000' }
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    toast.success('Number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!isDigital) {
      if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!shippingAddress.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^01[0-9]{9}$/.test(shippingAddress.phone.trim())) {
        newErrors.phone = 'Enter valid 11-digit phone number';
      }
      if (!shippingAddress.address.trim()) newErrors.address = 'Street address is required';
      if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    }

    if (paymentMethod !== 'cod') {
      if (!transactionId.trim()) {
        newErrors.transactionId = 'Transaction ID required';
      } else if (transactionId.length < 6) {
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

    if (!directProduct && cart.length === 0) {
      toast.error('Your cart is empty');
      router.push('/');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    // Build items payload
    let orderItems = [];
    if (directProduct) {
      orderItems = [{
        productId: directProduct._id || directProduct.id || queryProductId,
        quantity: 1,
        price: directProduct.salePrice || directProduct.price,
        vendor: directProduct.vendorId || directProduct.vendor,
        productType: directProduct.productType || (isDigital ? 'digital' : 'physical')
      }];
    } else {
      orderItems = cart.map((item: any) => ({
        productId: item.productId || item._id || item.id,
        quantity: item.quantity || 1,
        price: item.salePrice || item.price,
        vendor: item.vendor || item.vendorId,
        productType: item.productType || (isDigital ? 'digital' : 'physical')
      }));
    }

    setProcessing(true);
    try {
      const response = await axios.post('/api/orders/create', {
        items: orderItems,
        productId: queryProductId || undefined,
        shippingAddress: isDigital ? null : shippingAddress,
        deliveryCharge,
        totalAmount: finalTotalAmount,
        paymentMethod,
        productType: isDigital ? 'digital' : 'physical',
        transactionId: paymentMethod !== 'cod' ? transactionId.trim() : undefined,
        senderNumber: paymentMethod !== 'cod' ? senderNumber.trim() : undefined
      });

      if (response.data.success) {
        setOrderId(response.data.data?.order?.orderId || response.data.data?.order?._id);
        setOrderComplete(true);
        clearCart();
        toast.success(isDigital ? 'Order placed! Waiting for payment verification.' : 'Order placed successfully!');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      const serverError = error.response?.data?.error || 'Purchase failed';
      toast.error(serverError);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || fetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6 text-sm">
              {isDigital 
                ? 'Your payment details are submitted to Admin. Access will be unlocked once approved.' 
                : 'Thank you for your purchase. We are processing your order.'}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left border">
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
              <Link href="/orders" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                View My Orders
              </Link>
              <Link href="/" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {isDigital ? 'Digital Instant Checkout' : 'Checkout'}
        </h1>

        <form onSubmit={handlePurchase} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* SHIPPING ADDRESS SECTION - ONLY SHOW FOR PHYSICAL PRODUCTS */}
            {!isDigital ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" /> Shipping Address & Delivery Area
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-indigo-600" /> Select Delivery Area *
                    </label>
                    <select
                      name="deliveryArea"
                      value={shippingAddress.deliveryArea}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                    >
                      <option value="inside_dhaka">Inside Dhaka (Delivery Charge: ৳60)</option>
                      <option value="outside_dhaka">Outside Dhaka (Delivery Charge: ৳120)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleShippingChange}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="House/Apartment, Area, Road"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City / District *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl flex items-center gap-3">
                <DownloadCloud className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm">Instant Digital Delivery</h3>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    No physical shipping required. Access and download links will be generated automatically upon admin verification.
                  </p>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD SECTION */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Select Payment Method
              </h2>
              
              <div className={`grid ${isDigital ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-6`}>
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

                {!isDigital && (
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
                )}
              </div>

              {paymentMethod !== 'cod' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Step 1: Send ${finalTotalAmount.toFixed(2)} to our {paymentMethod} merchant number
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
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Step 2: Enter Transaction ID *</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm ${errors.transactionId ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full px-4 py-2 border rounded-lg text-sm ${errors.senderNumber ? 'border-red-500' : 'border-gray-300'}`}
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

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {directProduct ? (
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="font-medium text-gray-800 line-clamp-1">{directProduct.title}</span>
                    <span className="font-semibold text-gray-900">${(directProduct.salePrice || directProduct.price).toFixed(2)}</span>
                  </div>
                ) : (
                  cart.map((item: any) => (
                    <div key={item.productId || item._id || item.id} className="flex justify-between items-center text-sm border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-gray-900">${((item.salePrice || item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${checkoutPrice.toFixed(2)}</span>
                </div>

                {!isDigital && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping ({shippingAddress.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                    <span className="text-gray-900 font-medium">${deliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">${finalTotalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || (!directProduct && cart.length === 0)}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-sm"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  isDigital ? `Pay & Get Instant Access - $${finalTotalAmount.toFixed(2)}` : `Place Order - $${finalTotalAmount.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}