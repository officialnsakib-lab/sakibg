'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
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
  const params = useParams();
  const searchParams = useSearchParams();
  const { cart, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Dynamic route product ID (e.g. /checkout/6aa623eaf873bbd6819986cd)
  const routeProductId = params?.id || params?.ib;

  const [productData, setProductData] = useState<any>(null);
  const [fetchingProduct, setFetchingProduct] = useState<boolean>(!!routeProductId);

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

  // Fetch product if direct URL purchase
  useEffect(() => {
    if (routeProductId) {
      axios.get(`/api/products/${routeProductId}`)
        .then(res => {
          if (res.data?.product) {
            setProductData(res.data.product);
          } else if (res.data?.data) {
            setProductData(res.data.data);
          } else {
            setProductData(res.data);
          }
        })
        .catch(err => console.error('Fetch product error:', err))
        .finally(() => setFetchingProduct(false));
    }
  }, [routeProductId]);

  // Digital product detection
  const isDigital = 
    searchParams.get('type') === 'digital' || 
    productData?.productType === 'digital' || 
    cart.some((item: any) => item.productType === 'digital');

  useEffect(() => {
    if (user?.name && !shippingAddress.fullName) {
      setShippingAddress(prev => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  // Safe Price Calculations (Prevents undefined.toFixed errors)
  const getItemPrice = (item: any) => {
    if (!item) return 0;
    const p = item.salePrice ?? item.price ?? 0;
    return typeof p === 'number' ? p : Number(p) || 0;
  };

  const checkoutPrice = productData 
    ? getItemPrice(productData) 
    : (totalAmount || 0);

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
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!isDigital) {
      if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!shippingAddress.address.trim()) newErrors.address = 'Street address is required';
      if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    }

    if (paymentMethod !== 'cod') {
      if (!transactionId.trim()) newErrors.transactionId = 'Transaction ID required';
      if (!senderNumber.trim()) newErrors.senderNumber = 'Your Mobile number required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      router.push(`/login?redirect=/checkout/${routeProductId || ''}`);
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    // Build payload items list
    let orderItems = [];
    if (productData) {
      orderItems = [{
        productId: productData._id || productData.id || routeProductId,
        quantity: 1,
        price: getItemPrice(productData),
        vendor: productData.vendorId || productData.vendor,
        productType: productData.productType || (isDigital ? 'digital' : 'physical')
      }];
    } else if (cart.length > 0) {
      orderItems = cart.map((item: any) => ({
        productId: item.productId || item._id || item.id,
        quantity: item.quantity || 1,
        price: getItemPrice(item),
        vendor: item.vendor || item.vendorId,
        productType: item.productType || (isDigital ? 'digital' : 'physical')
      }));
    } else if (routeProductId) {
      orderItems = [{
        productId: routeProductId,
        quantity: 1,
        price: checkoutPrice,
        productType: isDigital ? 'digital' : 'physical'
      }];
    }

    if (orderItems.length === 0) {
      toast.error('No items to purchase');
      return;
    }

    setProcessing(true);
    try {
      const response = await axios.post('/api/orders/create', {
        items: orderItems,
        productId: routeProductId,
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
        toast.success(isDigital ? 'Order placed! Sent for admin approval.' : 'Order placed successfully!');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      const serverMsg = error.response?.data?.error || 'Purchase failed';
      toast.error(serverMsg);
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
                ? 'Your payment details are submitted to Admin. Download access will be granted once approved.' 
                : 'Thank you for your purchase. We are processing your order.'}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-left border text-sm">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-gray-900">{orderId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="font-semibold text-gray-900 uppercase">{paymentMethod}</p>
              </div>
              {paymentMethod !== 'cod' && (
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-900">{transactionId}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/orders" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                View My Orders
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {isDigital ? 'Digital Instant Checkout' : 'Checkout'}
        </h1>

        <form onSubmit={handlePurchase} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Address - Only Physical */}
            {!isDigital ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" /> Shipping Address
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Delivery Area *</label>
                    <select
                      name="deliveryArea"
                      value={shippingAddress.deliveryArea}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="inside_dhaka">Inside Dhaka (৳60)</option>
                      <option value="outside_dhaka">Outside Dhaka (৳120)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    placeholder="Full Name *"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    placeholder="Phone Number *"
                  />
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    placeholder="Street Address *"
                  />
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    placeholder="City / District *"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl flex items-center gap-3">
                <DownloadCloud className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-indigo-900 text-sm">Instant Digital Access</h3>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    No physical delivery needed. Download link will be enabled automatically after Admin verifies your payment.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Select Payment Method
              </h2>
              
              <div className={`grid ${isDigital ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-6`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-lg border-2 text-center ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
                >
                  <div className="font-bold text-pink-600">bKash</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-lg border-2 text-center ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <div className="font-bold text-orange-600">Nagad</div>
                </button>

                {!isDigital && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-lg border-2 text-center ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                  >
                    <div className="font-bold text-indigo-600">COD</div>
                  </button>
                )}
              </div>

              {paymentMethod !== 'cod' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-900">
                    Step 1: Send ${finalTotalAmount.toFixed(2)} to {paymentMethod} number:
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="font-mono font-bold">{paymentInfo[paymentMethod].number}</span>
                    <button type="button" onClick={() => copyNumber(paymentInfo[paymentMethod].number)} className="text-xs text-indigo-600 font-semibold">
                      Copy
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Step 2: Enter Transaction ID *</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white"
                      placeholder="e.g. 9HJ8KLMN3P"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Step 3: Your {paymentMethod} Number *</label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {productData ? (
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="font-medium text-gray-800 line-clamp-1">{productData.title || 'Digital Product'}</span>
                    <span className="font-semibold text-gray-900">${getItemPrice(productData).toFixed(2)}</span>
                  </div>
                ) : (
                  cart.map((item: any) => (
                    <div key={item.productId || item._id} className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                      <span className="font-semibold text-gray-900">${(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}</span>
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
                    <span>Shipping</span>
                    <span>${deliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">${finalTotalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Submit Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}