'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  BadgeCheck,
  Award,
  Sparkles,
  Package,
  Clock,
  TrendingUp,
  Heart,
  CheckCircle,
  Download
} from 'lucide-react';
import { formatNumber, calculateDiscount, calculateSaveAmount } from '@/lib/format';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    category: string;
    productType: string;
    price: number;
    salePrice: number | null;
    thumbnailUrl: string;
    averageRating: number;
    totalReviews: number;
    sales: number;
    views: number;
    downloads: number;
    isFeatured: boolean;
    isBestSeller: boolean;
    isVerified: boolean;
    isPremium: boolean;
    isNew: boolean;
    createdAt: string;
    vendor?: {
      name: string;
      avatar: string;
      isApprovedVendor?: boolean;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const discount = calculateDiscount(product.price, product.salePrice || 0);
  const saveAmount = calculateSaveAmount(product.price, product.salePrice || 0);

  const getAge = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      router.push(`/login?redirect=/checkout/${product._id}`);
      return;
    }
    
    router.push(`/checkout/${product._id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group border border-gray-100 flex flex-col relative">
      {/* Image Section */}
      <Link href={`/digital-products/${product._id}`} className="relative h-44 sm:h-48 bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden block">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-14 h-14 text-white/50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Premium Badge - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isPremium && (
            <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-lg">
              <Award className="w-3.5 h-3.5" />
              PREMIUM
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              FEATURED
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              BEST SELLER
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              NEW
            </span>
          )}
        </div>

        {/* Discount - Top Right */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-extrabold px-2.5 py-1 rounded-lg shadow-lg">
            -{discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
            toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
          }}
          className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Verified */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
            {product.category}
          </span>
          {product.isVerified && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <BadgeCheck className="w-3 h-3" />
              VERIFIED
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/digital-products/${product._id}`}>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-800">
            {product.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            ({formatNumber(product.totalReviews || 0)})
          </span>
        </div>

        {/* Stats - Views & Sales & Downloads */}
        <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-800">{formatNumber(product.views || 0)}</span> views
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-800">{formatNumber(product.sales || 0)}</span> sales
          </span>
          {product.downloads > 0 && (
            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-800">{formatNumber(product.downloads || 0)}</span>
            </span>
          )}
        </div>

        {/* Age */}
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Listed {getAge(product.createdAt)}
        </p>

        {/* Price Section - Prominent */}
        <div className="mb-4">
          {product.salePrice ? (
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 leading-none">
                ${product.salePrice}
              </span>
              <span className="text-base text-gray-400 line-through font-medium">
                ${product.price}
              </span>
              {saveAmount > 0 && (
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                  SAVE ${saveAmount}
                </span>
              )}
            </div>
          ) : (
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 leading-none">
              ${product.price}
            </span>
          )}
        </div>

        {/* Buy Button - Full Width */}
        <button
          onClick={handleBuyNow}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-bold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Buy Now
        </button>

        {/* Vendor Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {product.vendor?.name?.charAt(0) || 'V'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {product.vendor?.name || 'Unknown'}
              </p>
              {product.vendor?.isApprovedVendor && (
                <p className="text-[10px] text-blue-600 flex items-center gap-0.5">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Seller
                </p>
              )}
            </div>
          </div>
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}