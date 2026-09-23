'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Star, Loader2, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (rating === 0) newErrors.rating = 'Please select rating';
    if (!comment.trim()) newErrors.comment = 'Please write a review';
    if (comment.length < 10) newErrors.comment = 'Review must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix errors');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/reviews/create', {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim()
      });
      
      if (response.data.success) {
        toast.success('Review submitted!');
        setRating(0);
        setTitle('');
        setComment('');
        onReviewSubmitted();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hoverRating || rating) > i
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Summary of your review"
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg text-sm ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Share your experience with this product..."
            maxLength={1000}
          />
          {errors.comment ? (
            <p className="text-xs text-red-500 mt-1">{errors.comment}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Submit Review
        </button>
      </form>
    </div>
  );
}