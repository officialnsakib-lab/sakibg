'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  Eye, 
  BadgeCheck, 
  Award, 
  Sparkles, 
  Package, 
  Clock, 
  TrendingUp, 
  Heart, 
  CheckCircle, 
  Download,
  DownloadCloud,
  ArrowRight,
  ShoppingCart,
  ShoppingBag
} from 'lucide-react';
import { formatNumber, calculateDiscount } from '@/lib/format';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    category: string;
    productType?: string;
    product_type?: string;
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
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const isLoved = isInWishlist(product._id);

  const type = product.productType || product.product_type || '';
  const isDigital = type.toLowerCase() === 'digital';
  
  const productDetailPageUrl = isDigital 
    ? `/digital-products/${product._id}` 
    : `/physical-products/${product._id}`;

  const originalPrice = Number(product.price) || 0;
  const salePrice = product.salePrice ? Number(product.salePrice) : originalPrice;

  const discount = calculateDiscount(originalPrice, salePrice);

  const getAge = (date: string) => {
    if (!date) return 'Recently';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const handleInstallAndGet = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to get this product');
      router.push(`/login?redirect=/checkout/${product._id}?type=digital`);
      return;
    }
    
    router.push(`/checkout/${product._id}?type=digital`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to cart successfully!');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      router.push(`/login?redirect=/checkout/${product._id}`);
      return;
    }
    
    addToCart(product);
    router.push(`/checkout/${product._id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group border border-gray-100 flex flex-col justify-between w-full">
      <div>
        {/* Image Section: Mobile এ উচ্চতা ছোট (h-32) এবং Desktop এ স্বাভাবিক (sm:h-44) রাখা হয়েছে */}
        <Link href={productDetailPageUrl} className="relative h-32 sm:h-44 bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden block w-full">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 sm:w-12 sm:h-12 text-white/50" />
            </div>
          )}

          {/* Badges - Top Left */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
            {product.isPremium && (
              <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[9px] sm:text-[11px] font-bold rounded flex items-center gap-0.5 shadow">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> PREMIUM
              </span>
            )}
            {product.isFeatured && (
              <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[9px] sm:text-[11px] font-bold rounded flex items-center gap-0.5 shadow">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> FEATURED
              </span>
            )}
          </div>

          {/* Discount - Top Right */}
          {discount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded shadow z-10">
              -{discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToWishlist(product._id);
            }}
            className="absolute bottom-1.5 right-1.5 bg-white/90 p-1.5 rounded-full shadow hover:bg-white z-10"
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </Link>

        {/* Content Section: মোবাইলের জন্য প্যাডিং কমানো হয়েছে (p-2 sm:p-4) */}
        <div className="p-2 sm:p-4">
          {/* Category & Verified */}
          <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-full truncate">
              {product.category || 'General'}
            </span>
            {product.isVerified && (
              <span className="text-[8px] sm:text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 sm:px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> VERIFIED
              </span>
            )}
          </div>

          {/* Title: মোবাইলে ফন্ট ছোট ও এক লাইনে রাখা হয়েছে */}
          <Link href={productDetailPageUrl}>
            <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-1 sm:mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mb-1.5 sm:mb-3 text-[10px] sm:text-xs">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-800 text-[10px] sm:text-xs">
              {product.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-400 text-[9px] sm:text-xs">
              ({formatNumber(product.totalReviews || 0)})
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-2 sm:mb-4">
            {product.salePrice && salePrice < originalPrice ? (
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-sm sm:text-2xl font-extrabold text-indigo-600 leading-none">
                  ${salePrice}
                </span>
                <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                  ${originalPrice}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-2xl font-extrabold text-indigo-600 leading-none">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions & Vendor */}
      <div className="p-2 sm:p-4 pt-0 mt-auto">
        {/* Buttons: মোবাইলে ছোট ফন্ট ও কম প্যাডিং দিয়ে বাটন ফিট করা হয়েছে */}
        <div className="mb-2">
          {isDigital ? (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <button
                onClick={handleInstallAndGet}
                className="py-1 sm:py-2.5 px-1 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[9px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1.5 transition shadow-sm truncate"
              >
                <DownloadCloud className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0" /> Install
              </button>
              <button
                onClick={handleInstallAndGet}
                className="py-1 sm:py-2.5 px-1 sm:px-3 bg-gray-900 hover:bg-black text-white rounded-md font-bold text-[9px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1.5 transition shadow-sm truncate"
              >
                Get Now <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <button
                onClick={handleAddToCart}
                className="py-1 sm:py-2.5 px-1 sm:px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-bold text-[9px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1.5 transition truncate"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0" /> Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="py-1 sm:py-2.5 px-1 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[9px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1.5 transition shadow-sm truncate"
              >
                <ShoppingBag className="w-2.5 h-2.5 sm:w-4 sm:h-4 flex-shrink-0" /> Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Vendor Info */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-3 border-t border-gray-100 text-[9px] sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-2 truncate">
            <div className="w-4 h-4 sm:w-7 sm:h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-[8px] sm:text-xs font-bold flex-shrink-0">
              {product.vendor?.name?.charAt(0) || 'V'}
            </div>
            <span className="font-semibold text-gray-800 truncate">
              {product.vendor?.name || 'Verified Seller'}
            </span>
          </div>
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}