'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  BadgeCheck,
  Award,
  Eye,
  Download,
  TrendingUp,
  Shield,
  Zap,
  Headphones,
  Globe,
  Package,
  Clock,
  CheckCircle,
  CloudDownload,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { formatNumber, calculateDiscount, calculateSaveAmount } from '@/lib/format';

interface ProductInfoProps {
  product: any;
  onWishlist: () => void;
  isWishlisted: boolean;
}

export default function ProductInfo({ product, onWishlist, isWishlisted }: ProductInfoProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const discount = calculateDiscount(product.price, product.salePrice || 0);
  const saveAmount = calculateSaveAmount(product.price, product.salePrice || 0);

  const isDigital = product.productType === 'digital' || product.productType === 'website' || product.productType === 'software';

  // কার্ট হ্যান্ডলার (ফিজিক্যাল প্রোডাক্টের জন্য সঠিক /physical-products/ পাথ দেওয়া হলো)
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push(`/login?redirect=/physical-products/${product._id}`);
      return;
    }
    // আপনার কার্ট লজিক বা API এখানে যুক্ত করতে পারেন
    toast.success('Product added to cart!');
  };

  // চেকআউট বা বাই নাউ হ্যান্ডলার
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      const targetPath = isDigital 
        ? `/checkout/${product._id}?type=digital` 
        : `/checkout/${product._id}`;
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (isDigital) {
      router.push(`/checkout/${product._id}?type=digital`);
    } else {
      router.push(`/checkout/${product._id}`);
    }
  };

  return (
    <div>
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {product.isPremium && (
          <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs font-bold rounded-lg flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> PREMIUM
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-lg">
            FEATURED
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
            BEST SELLER
          </span>
        )}
        {product.isVerified && (
          <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5" /> VERIFIED
          </span>
        )}
        <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg uppercase">
          {product.productType || 'Product'}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{product.title}</h1>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-gray-600 dark:text-slate-400 mb-4">{product.shortDescription}</p>
      )}

      {/* Vendor */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {product.vendor?.name?.charAt(0) || 'V'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
            {product.vendor?.name}
            {product.vendor?.isApprovedVendor && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Verified Seller</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.averageRating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="font-bold text-gray-900 dark:text-slate-100 text-lg">{product.averageRating?.toFixed(1) || '0.0'}</span>
        <span className="text-gray-500 text-sm">({formatNumber(product.totalReviews || 0)} reviews)</span>
        <span className="text-gray-300">•</span>
        <span className="text-gray-500 text-sm flex items-center gap-1">
          <Eye className="w-4 h-4" /> {formatNumber(product.views || 0)} views
        </span>
      </div>

      {/* Price */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 border dark:border-slate-800 rounded-xl p-4 mb-5">
        {product.salePrice ? (
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">${product.salePrice}</span>
            <span className="text-xl text-gray-400 line-through">${product.price}</span>
            {saveAmount > 0 && (
              <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-950/60 dark:text-green-400 px-2 py-1 rounded-lg">
                SAVE ${saveAmount} ({discount}%)
              </span>
            )}
          </div>
        ) : (
          <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">${product.price}</span>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-slate-400">
          {isDigital && (
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" /> {formatNumber(product.downloads || 0)} downloads
            </span>
          )}
          <span className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> {formatNumber(product.sales || 0)} sales
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Trending
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mb-5">
        {/* Left Button: Install (Digital) / Add to Cart (Physical) */}
        <button
          onClick={isDigital ? handleCheckout : handleAddToCart}
          className={`flex-1 px-4 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            isDigital 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : 'bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          {isDigital ? <CloudDownload className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          <span>{isDigital ? 'Install' : 'Add to Cart'}</span>
        </button>

        {/* Right Button: Get Now (Digital) / Buy Now (Physical) */}
        <button
          onClick={handleCheckout}
          className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {!isDigital && <ShoppingBag className="w-5 h-5" />}
          <span>{isDigital ? 'Get Now' : 'Buy Now'}</span>
          {isDigital && <ArrowRight className="w-5 h-5" />}
        </button>

        {/* Wishlist Button */}
        <button
          onClick={onWishlist}
          className={`p-3.5 border rounded-xl transition-colors ${
            isWishlisted ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-slate-300'}`} />
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
          }}
          className="p-3.5 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
          <Shield className="w-4 h-4 text-green-500" /> Secure
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
          <Zap className="w-4 h-4 text-yellow-500" /> {isDigital ? 'Instant' : 'Fast Delivery'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
          <Headphones className="w-4 h-4 text-blue-500" /> 24/7 Support
        </div>
      </div>

      {/* Website Demo */}
      {product.productType === 'website' && product.demoUrl && (
        <a
          href={product.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors mb-5"
        >
          <Globe className="w-5 h-5" />
          View Live Demo
        </a>
      )}

      {/* Meta Info */}
      <div className="border-t border-gray-200 dark:border-slate-800 pt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <Package className="w-4 h-4" />
          Category: <span className="text-gray-900 dark:text-slate-200 font-medium capitalize">{product.category}</span>
        </p>
        <p className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          Published: <span className="text-gray-900 dark:text-slate-200">{new Date(product.createdAt).toLocaleDateString()}</span>
        </p>
        {product.version && (
          <p className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <CheckCircle className="w-4 h-4" />
            Version: <span className="text-gray-900 dark:text-slate-200">{product.version}</span>
          </p>
        )}
      </div>
    </div>
  );
}