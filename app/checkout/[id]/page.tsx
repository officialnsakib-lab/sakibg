'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext'; // ১. কারেন্সি হুক ইমপোর্ট করা হলো
import { toast } from 'react-hot-toast';
import { 
  Loader2,
  CheckCircle,
  Truck,
  CreditCard
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { cart, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { currency, exchangeRate, formatPrice, convertPrice } = useCurrency(); // ২. কারেন্সি মেথডগুলো কল করা হলো

  // Dynamic route product ID (supports [ib] or [id])
  const routeProductId = params?.ib || params?.id;

  const [productData, setProductData] = useState<any>(null);
  const [fetchingProduct, setFetchingProduct] = useState<boolean>(!!routeProductId);

  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [copied, setCopied] = useState(false);

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
          const responseData = res.data?.data || res.data;
          if (responseData?.product) {
            setProductData(responseData.product);
          } else {
            setProductData(responseData);
          }
        })
        .catch(err => console.error('Fetch product error:', err))
        .finally(() => setFetchingProduct(false));
    }
  }, [routeProductId]);

  useEffect(() => {
    if (user?.name && !shippingAddress.fullName) {
      setShippingAddress(prev => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  // Safe Price Calculations (USD Base)
  const getItemPrice = (item: any) => {
    if (!item) return 0;
    const p = item.salePrice ?? item.price ?? 0;
    if (typeof p === 'object') {
      return Number(p.$numberDecimal || p.value || 0) || 0;
    }
    return typeof p === 'number' ? p : Number(p) || 0;
  };

  const checkoutPrice = productData 
    ? getItemPrice(productData) 
    : (totalAmount || 0);

  // ডেলিভারি চার্জ টাকায় فিক্সড (ঢাকার ভেতরে ৬০ টাকা ~ $0.50, বাইরে ১২০ টাকা ~ $1.00 ধরে USD এ কনভার্ট করা হলো)
  const deliveryChargeInUSD = shippingAddress.deliveryArea === 'inside_dhaka' ? 0.50 : 1.00;
  
  const finalTotalAmountInUSD = checkoutPrice + deliveryChargeInUSD;

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
    if (!shippingAddress.fullName.trim()) return false;
    if (!shippingAddress.phone.trim()) return false;
    if (!shippingAddress.address.trim()) return false;
    if (!shippingAddress.city.trim()) return false;

    if (paymentMethod !== 'cod') {
      if (!transactionId.trim()) return false;
      if (!senderNumber.trim()) return false;
    }
    
    return true;
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

    // Build payload items list (Physical & Food items only)
    let orderItems = [];
    if (productData) {
      orderItems = [{
        productId: productData._id || productData.id || routeProductId,
        quantity: 1,
        price: getItemPrice(productData),
        vendor: productData.vendorId || productData.vendor,
        productType: 'physical'
      }];
    } else if (cart.length > 0) {
      orderItems = cart.map((item: any) => ({
        productId: item.productId || item._id || item.id,
        quantity: item.quantity || 1,
        price: getItemPrice(item),
        vendor: item.vendor || item.vendorId,
        productType: 'physical'
      }));
    } else if (routeProductId) {
      orderItems = [{
        productId: routeProductId,
        quantity: 1,
        price: checkoutPrice,
        productType: 'physical'
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
        shippingAddress: shippingAddress,
        deliveryCharge: deliveryChargeInUSD,
        totalAmount: finalTotalAmountInUSD,
        currency,
        exchangeRate,
        paymentMethod,
        productType: 'physical',
        transactionId: paymentMethod !== 'cod' ? transactionId.trim() : undefined,
        senderNumber: paymentMethod !== 'cod' ? senderNumber.trim() : undefined
      });

      if (response.data.success) {
        setOrderId(response.data.data?.order?.orderId || response.data.data?.order?._id);
        setOrderComplete(true);
        clearCart();
        toast.success('Order placed successfully!');
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
              Thank you for your purchase. We are processing your order for delivery.
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
          Checkout
        </h1>

        <form onSubmit={handlePurchase} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Address */}
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
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-900"
                  >
                    <option value="inside_dhaka">Inside Dhaka ({formatPrice(0.50)})</option>
                    <option value="outside_dhaka">Outside Dhaka ({formatPrice(1.00)})</option>
                  </select>
                </div>

                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900"
                  placeholder="Full Name *"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900"
                  placeholder="Phone Number *"
                  required
                />
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900"
                  placeholder="Street Address *"
                  required
                />
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm text-gray-900"
                  placeholder="City / District *"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Select Payment Method
              </h2>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
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

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-lg border-2 text-center ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                >
                  <div className="font-bold text-indigo-600">COD</div>
                </button>
              </div>

              {paymentMethod !== 'cod' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-900">
                    Step 1: Send {formatPrice(finalTotalAmountInUSD)} to {paymentMethod} number:
                  </p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="font-mono font-bold text-gray-900">{paymentInfo[paymentMethod].number}</span>
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
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-900"
                      placeholder="e.g. 9HJ8KLMN3P"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Step 3: Your {paymentMethod} Number *</label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-900"
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
                    <span className="font-medium text-gray-800 line-clamp-1">{productData.title || 'Product'}</span>
                    <span className="font-semibold text-gray-900">{formatPrice(getItemPrice(productData))}</span>
                  </div>
                ) : (
                  cart.map((item: any) => {
                    const itemPrice = getItemPrice(item);
                    const qty = item.quantity || 1;
                    return (
                      <div key={item.productId || item._id} className="flex justify-between items-center text-sm border-b pb-2">
                        <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(itemPrice * qty)}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-medium">{formatPrice(checkoutPrice)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-900 font-medium">{formatPrice(deliveryChargeInUSD)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">{formatPrice(finalTotalAmountInUSD)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm & Submit Order - ${formatPrice(finalTotalAmountInUSD)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}