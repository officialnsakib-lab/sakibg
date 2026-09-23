'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, Package, ChevronRight, Globe } from 'lucide-react';
import ProductInfo from '@/components/product/ProductInfo';
import ReviewsSection from '@/components/product/ReviewsSection';
import RelatedProducts from '@/components/product/RelatedProducts';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

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
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/digital-products" className="hover:text-indigo-600">
              {product.productType === 'website' ? 'Websites' : 'Products'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Top: Image + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-72 sm:h-96 bg-gradient-to-br from-indigo-500 to-violet-600">
              {product.thumbnailUrl ? (
                <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {product.productType === 'website' ? (
                    <Globe className="w-20 h-20 text-white/50" />
                  ) : (
                    <Package className="w-20 h-20 text-white/50" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <ProductInfo
              product={product}
              onWishlist={() => setIsWishlisted(!isWishlisted)}
              isWishlisted={isWishlisted}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-4">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'description' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
                }`}
              >
                Reviews ({product.totalReviews || 0})
              </button>
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'description' ? (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                
                {product.features?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                    <ul className="space-y-1.5">
                      {product.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span> {feature}
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

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}