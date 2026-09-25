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
  Download
} from 'lucide-react';
import { formatNumber, calculateDiscount } from '@/lib/format';

interface HomeProductCardProps {
  product: {
    _id: string;
    title: string;
    category: string;
    productType?: string;
    isDigital?: boolean;
    type?: string;
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

  const isDigital = 
    Boolean(product.isDigital) ||
    product.productType?.toLowerCase() === 'digital' ||
    product.type?.toLowerCase() === 'digital' ||
    product.productType?.toLowerCase() === 'website';

  const productDetailUrl = isDigital 
    ? `/digital-products/${product._id}` 
    : `/physical-products/${product._id}`;

  const discount = calculateDiscount(product.price, product.salePrice || 0);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to proceed');
      router.push(`/login?redirect=${productDetailUrl}`);
      return;
    }
    
    router.push(productDetailUrl);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group border border-gray-100 flex flex-col justify-between w-full">
      <div>
        {/* Image Container: মোবাইল স্ক্রিনে উচ্চতা আরও কমিয়ে h-24 করা হয়েছে */}
        <Link href={productDetailUrl} className="relative h-24 sm:h-40 bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden block w-full">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {product.productType === 'website' ? (
                <Globe className="w-6 h-6 sm:w-10 sm:h-10 text-white/50" />
              ) : (
                <Package className="w-6 h-6 sm:w-10 sm:h-10 text-white/50" />
              )}
            </div>
          )}

          {/* Dynamic Type Tag */}
          <span className={`absolute bottom-1 left-1 text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded shadow ${
            isDigital ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isDigital ? 'DIGITAL' : 'PHYSICAL'}
          </span>

          {/* Badges */}
          <div className="absolute top-1 left-1 flex flex-col gap-0.5">
            {product.isPremium && (
              <span className="px-1 py-0.5 bg-yellow-400 text-yellow-900 text-[8px] sm:text-[10px] font-bold rounded flex items-center gap-0.5 shadow">
                <Award className="w-2.5 h-2.5" /> PREMIUM
              </span>
            )}
            {product.isFeatured && (
              <span className="px-1 py-0.5 bg-purple-500 text-white text-[8px] sm:text-[10px] font-bold rounded flex items-center gap-0.5 shadow">
                <Sparkles className="w-2.5 h-2.5" /> FEATURED
              </span>
            )}
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow">
              -{discount}%
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute bottom-1 right-1 bg-white/90 p-1 rounded-full shadow"
          >
            <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </Link>

        {/* Content: প্যাডিং ও মার্জিন কমিয়ে কম্প্যাক্ট করা হয়েছে */}
        <div className="p-2 sm:p-3 flex flex-col">
          {/* Category */}
          <span className="text-[8px] sm:text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full capitalize self-start mb-0.5 truncate max-w-full">
            {product.category}
          </span>

          {/* Title */}
          <Link href={productDetailUrl}>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-1 text-[9px] sm:text-xs">
            <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <span className="font-bold text-gray-800">
              {product.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-400 text-[8px] sm:text-xs">({formatNumber(product.totalReviews || 0)})</span>
          </div>
        </div>
      </div>

      {/* Price & Action Button Footer */}
      <div className="p-2 sm:p-3 pt-0 mt-auto">
        <div className="flex justify-between items-center gap-1">
          <div>
            {product.salePrice ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-lg font-extrabold text-indigo-600">${product.salePrice}</span>
                <span className="text-[9px] sm:text-xs text-gray-400 line-through">${product.price}</span>
              </div>
            ) : (
              <span className="text-xs sm:text-lg font-extrabold text-indigo-600">${product.price}</span>
            )}
          </div>

          <button
            onClick={handleAction}
            className={`px-2 py-1 text-[9px] sm:text-xs font-bold rounded-lg text-white flex items-center gap-1 transition-colors flex-shrink-0 ${
              isDigital 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isDigital ? (
              <>
                <Download className="w-2.5 h-2.5 flex-shrink-0" />
                <span>Get</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-2.5 h-2.5 flex-shrink-0" />
                <span>Buy</span>
              </>
            )}
          </button>
        </div>

        {/* Vendor */}
        <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-gray-100 text-[9px] sm:text-xs">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-[7px] sm:text-[9px] font-bold flex-shrink-0">
            {product.vendor?.name?.charAt(0) || 'V'}
          </div>
          <span className="text-gray-600 truncate">{product.vendor?.name || 'Unknown'}</span>
          {product.vendor?.isApprovedVendor && (
            <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}