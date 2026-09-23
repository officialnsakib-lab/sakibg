'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, BadgeCheck, ThumbsUp, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface Review {
  _id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  likes: number;
  createdAt: string;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/reviews/${productId}`, {
          params: { page, limit: 5, sort }
        });
        if (response.data.success) {
          setReviews(response.data.data.reviews);
          setTotalPages(response.data.data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Reviews error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, page, sort]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort */}
      <div className="flex justify-end">
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>

      {/* Reviews */}
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg p-4 border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                {review.userName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm flex items-center gap-1">
                  {review.userName}
                  {review.isVerifiedPurchase && (
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                  )}
                </p>
                <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <p className="font-semibold text-gray-900 text-sm mb-1">{review.title}</p>
          )}

          {/* Comment */}
          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3">
            {review.isVerifiedPurchase && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                ✓ Verified Purchase
              </span>
            )}
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600">
              <ThumbsUp className="w-3.5 h-3.5" />
              {formatNumber(review.likes)} Helpful
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                page === i + 1 ? 'bg-indigo-600 text-white' : 'border text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}