'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, Package, ChevronRight, Globe, ShieldCheck, Zap, ArrowRight, CheckCircle, ShoppingCart, ShoppingBag } from 'lucide-react';
import ProductInfo from '@/components/product/ProductInfo';
import ReviewsSection from '@/components/product/ReviewsSection';
import RelatedProducts from '@/components/product/RelatedProducts';

export default function PhysicalProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        if (response.data.success) {
          setProduct(response.data.data.product);
          setRelatedProducts(response.data.data.relatedProducts || []);
        }
      } catch (error: any) {
        toast.error('Failed to load physical product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  // ফিজিক্যাল প্রোডাক্ট কার্টে যোগ করার হ্যান্ডলার
  const handleAddToCart = async () => {
    try {
      setSubmitting(true);
      // আপনার কার্ট API বা লজিক এখানে যুক্ত করুন
      toast.success('Product added to cart successfully!');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setSubmitting(false);
    }
  };

  // ফিজিক্যাল প্রোডাক্ট চেকআউট / বাই নাউ হ্যান্ডলার
  const handleBuyNow = () => {
    router.push(`/checkout/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Physical Product Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Global Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 py-3">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-xs sm:text-sm text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Physical Products Store — Available Worldwide for Shipping</span>
          </div>
          <div className="flex items-center gap-4 text-cyan-300 font-medium">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Fast Delivery</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link href="/" className="hover:text-cyan-400">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/physical-products" className="hover:text-cyan-400">
              Physical Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-100 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Product Thumbnail */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="h-80 sm:h-[420px] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 relative flex items-center justify-center p-4">
              {product.thumbnailUrl ? (
                <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover rounded-xl shadow-lg" />
              ) : (
                <Package className="w-24 h-24 text-cyan-400/40 animate-pulse" />
              )}
              <div className="absolute top-4 left-4 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Physical Product
              </div>
            </div>
            
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Standard Delivery available nationwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Secure Packaging & Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Product Info & Cart/Buy Options */}
          <div className="space-y-6">
            <ProductInfo
              product={product}
              onWishlist={() => setIsWishlisted(!isWishlisted)}
              isWishlisted={isWishlisted}
              isDigital={false}
            />

            {/* Direct Add to Cart / Buy Now Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Price</span>
                  <div className="text-2xl font-extrabold text-cyan-400">
                    ${product.price} <span className="text-xs text-slate-400 font-normal">USD</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-400 bg-green-950/50 border border-green-800/50 px-2.5 py-1 rounded-full font-medium">
                    In Stock & Ready
                  </span>
                </div>
              </div>

              {/* 🔴 Add to Cart এবং Buy Now বাটন */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleAddToCart}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Buy Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-xs text-slate-400">
                Cash on Delivery and Online Payments available at checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for Description & Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl mb-10 overflow-hidden">
          <div className="border-b border-slate-800">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'description' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Description & Features
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Reviews ({product.totalReviews || 0})
              </button>
            </div>
          </div>

          <div className="p-6 text-slate-300">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                <p className="leading-relaxed whitespace-pre-line text-slate-300">{product.description}</p>
                
                {product.features?.length > 0 && (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5">
                    <h3 className="font-bold text-slate-100 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" /> Specifications & Details
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {product.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-cyan-400 mt-0.5">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <ReviewsSection
                productId={product._id}
                averageRating={product.averageRating}
                totalReviews={product.totalReviews}
                ratingBreakdown={product.ratingBreakdown}
              />
            )}
          </div>
        </div>

        {/* Related Physical Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}