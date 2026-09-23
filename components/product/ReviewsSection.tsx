'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Star, BadgeCheck, ThumbsUp, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import ReviewForm from './ReviewForm';

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

interface ReviewsSectionProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown?: { [key: number]: number };
}

export default function ReviewsSection({ productId, averageRating, totalReviews, ratingBreakdown }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
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
  }, [productId, page, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-start gap-6">
          {/* Average */}
          <div className="text-center">
            <p className="text-5xl font-extrabold text-indigo-600">{averageRating?.toFixed(1) || '0.0'}</p>
            <div className="flex justify-center my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{formatNumber(totalReviews)} reviews</p>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown?.[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-3">{star}</span>
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-6">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={() => {
              setShowForm(false);
              fetchReviews();
            }}
          />
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : reviews.length > 0 ? (
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

          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm flex items-center gap-1">
                      {review.userName}
                      {review.isVerifiedPurchase && <BadgeCheck className="w-4 h-4 text-green-500" />}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {review.title && <p className="font-semibold text-gray-900 text-sm mb-1">{review.title}</p>}
              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
              {review.isVerifiedPurchase && (
                <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  ✓ Verified Purchase
                </span>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-2 rounded-lg text-sm ${page === i + 1 ? 'bg-indigo-600 text-white' : 'border text-gray-600'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No reviews yet.</div>
      )}
    </div>
  );
}