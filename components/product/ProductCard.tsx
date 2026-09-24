'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext'; // ✅ Wishlist Context ইমপোর্ট করা হলো
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
  const { addToWishlist, isInWishlist } = useWishlist(); // ✅ উইশলিস্ট কনটেক্সট থেকে ফাংশনগুলো নেওয়া হলো

  // প্রডাক্টটি উইশলিস্টে আছে কি না চেক করা
  const isLoved = isInWishlist(product._id);

  // ফিক্সড ও নিরাপদ প্রোডাক্ট টাইপ এবং রাউটিং লজিক
  const type = product.productType || product.product_type || '';
  const isDigital = type.toLowerCase() === 'digital';
  
  const productDetailPageUrl = isDigital 
    ? `/digital-products/${product._id}` 
    : `/physical-products/${product._id}`;

  const originalPrice = Number(product.price) || 0;
  const salePrice = product.salePrice ? Number(product.salePrice) : originalPrice;

  const discount = calculateDiscount(originalPrice, salePrice);
  const saveAmount = Math.max(0, originalPrice - salePrice).toFixed(2);

  const getAge = (date: string) => {
    if (!date) return 'Recently';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  // Digital Direct Install / Get Handler
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

  // Physical Add To Cart Handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to cart successfully!');
  };

  // Physical Buy Now Handler
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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group border border-gray-100 flex flex-col relative">
      {/* Image Section */}
      <Link href={productDetailPageUrl} className="relative h-44 sm:h-48 bg-gradient-to-br from-indigo-500 to-violet-600 overflow-hidden block">
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

        {/* Badges - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
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
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-lg z-10">
            -{discount}%
          </div>
        )}

        {/* ✅ Wishlist Button (Connected with global context) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToWishlist(product._id);
          }}
          className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
        >
          <Heart className={`w-4 h-4 ${isLoved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Verified */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
            {product.category || 'General'}
          </span>
          {product.isVerified && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <BadgeCheck className="w-3 h-3" />
              VERIFIED
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={productDetailPageUrl}>
          <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-800">
            {product.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            ({formatNumber(product.totalReviews || 0)})
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs mb-3 flex-wrap text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">{formatNumber(product.views || 0)}</span> views
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">{formatNumber(product.sales || product.downloads || 0)}</span> sales
          </span>
        </div>

        {/* Age */}
        <p className="text-[11px] text-gray-400 mb-3 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Listed {getAge(product.createdAt)}
        </p>

        {/* Pricing */}
        <div className="mb-4">
          {product.salePrice && salePrice < originalPrice ? (
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-2xl font-extrabold text-indigo-600 leading-none">
                ${salePrice}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">
                ${originalPrice}
              </span>
              {Number(saveAmount) > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  SAVE ${saveAmount}
                </span>
              )}
            </div>
          ) : (
            <span className="text-2xl font-extrabold text-indigo-600 leading-none">
              ${originalPrice}
            </span>
          )}
        </div>

        {/* Dynamic Action Buttons based on Product Type */}
        <div className="mt-auto pt-2">
          {isDigital ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallAndGet}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4" /> Install
              </button>
              
              <button
                onClick={handleInstallAndGet}
                className="flex-1 py-2.5 px-3 bg-gray-900 hover:bg-black text-white rounded-lg font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Get Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Vendor Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {product.vendor?.name?.charAt(0) || 'V'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {product.vendor?.name || 'Verified Seller'}
              </p>
            </div>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}