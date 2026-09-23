'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import HomeProductCard from './HomeProductCard';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get('/api/home');
        if (response.data.success) {
          setProducts(response.data.data.featuredProducts || []);
        }
      } catch (error) {
        console.error('Featured error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Featured Products
          </h2>
          <Link href="/digital-products?sort=featured" className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <HomeProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}