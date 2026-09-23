// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    
    // ============ FILTER PARAMS ============
    const productType = searchParams.get('type');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const websiteType = searchParams.get('websiteType');
    const search = searchParams.get('search');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const verified = searchParams.get('verified');
    const premium = searchParams.get('premium');
    const bestSeller = searchParams.get('bestSeller');
    const adsenseApproved = searchParams.get('adsenseApproved');
    
    // ============ SORT PARAMS ============
    const sort = searchParams.get('sort') || 'recommended';
    
    // ============ PAGINATION ============
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // ============ BUILD MATCH QUERY ============
    const matchQuery: any = { status: 'approved' };
    
    if (productType) {
      matchQuery.productType = productType;
    }
    
    if (category && category !== 'all') {
      matchQuery.category = category;
    }
    
    if (subCategory) {
      matchQuery.subCategory = subCategory;
    }
    
    if (websiteType) {
      matchQuery.websiteType = websiteType;
    }
    
    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice > 0 || maxPrice < 1000000) {
      matchQuery.price = { $gte: minPrice, $lte: maxPrice };
    }
    
    if (minRating > 0) {
      matchQuery.averageRating = { $gte: minRating };
    }
    
    if (tags && tags.length > 0) {
      matchQuery.tags = { $in: tags };
    }
    
    if (verified === 'true') {
      matchQuery.isVerified = true;
    }
    
    if (premium === 'true') {
      matchQuery.isPremium = true;
    }
    
    if (bestSeller === 'true') {
      matchQuery.isBestSeller = true;
    }
    
    if (adsenseApproved === 'true') {
      matchQuery.isAdsenseApproved = true;
    }
    
    // ============ SMART SCORE AGGREGATION ============
    const pipeline: any[] = [
      { $match: matchQuery },
      
      // Calculate smart score
      {
        $addFields: {
          smartScore: {
            $add: [
              { $multiply: [{ $divide: ['$sales', 100] }, 35] },
              { $multiply: ['$averageRating', 5] },
              { $multiply: [{ $divide: ['$views', 1000] }, 20] },
              { $multiply: [{ $divide: ['$totalReviews', 10] }, 15] },
              { $cond: [{ $eq: ['$isTrending', true] }, 5, 0] },
              { $cond: [{ $eq: ['$isFeatured', true] }, 10, 0] },
              { $cond: [{ $eq: ['$isBestSeller', true] }, 10, 0] },
              { $cond: [{ $eq: ['$isPremium', true] }, 5, 0] },
              { $cond: [{ $eq: ['$isVerified', true] }, 5, 0] }
            ]
          },
          popularityScore: {
            $add: [
              { $multiply: ['$sales', 0.4] },
              { $multiply: ['$averageRating', 20] },
              { $multiply: ['$views', 0.001] },
              { $multiply: ['$totalReviews', 5] }
            ]
          }
        }
      },
      
      { $sort: getSortStage(sort) },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      
      // Lookup vendor info
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },
      
      // Final projection
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          shortDescription: 1,
          productType: 1,
          category: 1,
          subCategory: 1,
          websiteType: 1,
          tags: 1,
          price: 1,
          salePrice: 1,
          discountPercent: 1,
          thumbnailUrl: 1,
          demoUrl: 1,
          videoUrl: 1,
          averageRating: 1,
          totalReviews: 1,
          sales: 1,
          views: 1,
          isFeatured: 1,
          isTrending: 1,
          isBestSeller: 1,
          isVerified: 1,
          isPremium: 1,
          isAdsenseApproved: 1,
          isNew: 1,
          smartScore: 1,
          popularityScore: 1,
          createdAt: 1,
          'vendor._id': '$vendorInfo._id',
          'vendor.name': '$vendorInfo.name',
          'vendor.avatar': '$vendorInfo.avatar',
          'vendor.isApprovedVendor': '$vendorInfo.isApprovedVendor'
        }
      }
    ];
    
    // ============ EXECUTE ============
    const products = await (Product as any).aggregate(pipeline);
    
    // Total count
    const totalResult = await (Product as any).aggregate([
      { $match: matchQuery },
      { $count: 'total' }
    ]);
    const total = totalResult[0]?.total || 0;
    
    // Categories with count
    const categoriesPipeline = [
      { $match: { status: 'approved', ...(productType ? { productType } : {}) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const categoriesResult = await (Product as any).aggregate(categoriesPipeline);
    const categories = categoriesResult.map((cat: any) => ({
      name: cat._id,
      count: cat.count
    }));
    
    // Price range
    const priceRangePipeline = [
      { $match: { status: 'approved', ...(productType ? { productType } : {}) } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ];
    const priceRangeResult = await (Product as any).aggregate(priceRangePipeline);
    
    // Top sellers
    const topSellersPipeline = [
      { $match: { status: 'approved', ...(productType ? { productType } : {}) } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          price: 1,
          salePrice: 1,
          thumbnailUrl: 1,
          sales: 1,
          averageRating: 1,
          isVerified: 1,
          'vendor.name': '$vendorInfo.name'
        }
      }
    ];
    const topSellers = await (Product as any).aggregate(topSellersPipeline);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          products,
          categories,
          topSellers,
          priceRange: priceRangeResult[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get products' },
      { status: 500 }
    );
  }
}

// ============ SORT HELPER ============
function getSortStage(sort: string): any {
  switch (sort) {
    case 'recommended':
      return { smartScore: -1, createdAt: -1 };
    case 'popular':
      return { sales: -1 };
    case 'trending':
      return { isTrending: -1, views: -1, sales: -1 };
    case 'rating':
      return { averageRating: -1, totalReviews: -1 };
    case 'most_viewed':
      return { views: -1 };
    case 'most_reviewed':
      return { totalReviews: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'price_low':
      return { price: 1 };
    case 'price_high':
      return { price: -1 };
    case 'featured':
      return { isFeatured: -1, smartScore: -1 };
    case 'best_seller':
      return { isBestSeller: -1, sales: -1 };
    case 'premium':
      return { isPremium: -1, smartScore: -1 };
    default:
      return { smartScore: -1, createdAt: -1 };
  }
}