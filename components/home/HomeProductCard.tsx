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
  Globe,
  TrendingUp,
  Heart,
  CheckCircle
} from 'lucide-react';
import { formatNumber, calculateDiscount, calculateSaveAmount } from '@/lib/format';

interface HomeProductCardProps {
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
    isFeatured: boolean;
    isBestSeller: boolean;
    isVerified: boolean;
    isPremium: boolean;
    isNew: boolean;
    createdAt: string;
    vendor?: {
      name: string;
      isApprovedVendor?: boolean;
    };
  };
}

export default function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const discount = calculateDiscount(product.price, product.salePrice || 0);

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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group border border-gray-100 flex flex-col">
      {/* Image */}
      <Link href={`/digital-products/${product._id}`} className="relative h-44 bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden block">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {product.productType === 'website' ? (
              <Globe className="w-12 h-12 text-white/50" />
            ) : (
              <Package className="w-12 h-12 text-white/50" />
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isPremium && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-[10px] font-bold rounded flex items-center gap-0.5">
              <Award className="w-3 h-3" /> PREMIUM
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> FEATURED
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> BEST SELLER
            </span>
          )}
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize self-start mb-1.5">
          {product.category}
        </span>

        {/* Title */}
        <Link href={`/digital-products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-800">
            {product.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-gray-400">({formatNumber(product.totalReviews || 0)})</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-700">{formatNumber(product.sales || 0)}</span> sold
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-700">{formatNumber(product.views || 0)}</span> views
          </span>
        </div>

        {/* Price & Buy */}
        <div className="flex justify-between items-center mt-auto">
          <div>
            {product.salePrice ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-indigo-600">${product.salePrice}</span>
                <span className="text-xs text-gray-400 line-through">${product.price}</span>
              </div>
            ) : (
              <span className="text-xl font-extrabold text-indigo-600">${product.price}</span>
            )}
          </div>

          <button
            onClick={handleBuyNow}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            title="Buy Now"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Vendor */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {product.vendor?.name?.charAt(0) || 'V'}
          </div>
          <span className="text-[11px] text-gray-600 truncate">{product.vendor?.name || 'Unknown'}</span>
          {product.vendor?.isApprovedVendor && (
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}