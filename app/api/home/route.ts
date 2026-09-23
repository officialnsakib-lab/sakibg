// app/api/home/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const productType = searchParams.get('type');
    
    // Build match query
    const matchQuery: any = { status: 'approved' };
    if (productType) {
      matchQuery.productType = productType;
    }
    
    // Featured products
    const featuredQuery: any = { status: 'approved', isFeatured: true };
    if (productType) {
      featuredQuery.productType = productType;
    }
    
    const featuredPipeline = [
      { $match: featuredQuery },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
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
          _id: 1,
          title: 1,
          slug: 1,
          productType: 1,
          category: 1,
          price: 1,
          salePrice: 1,
          discountPercent: 1,
          thumbnailUrl: 1,
          averageRating: 1,
          totalReviews: 1,
          sales: 1,
          views: 1,
          isFeatured: 1,
          isBestSeller: 1,
          isVerified: 1,
          isPremium: 1,
          isNew: 1,
          createdAt: 1,
          'vendor._id': '$vendorInfo._id',
          'vendor.name': '$vendorInfo.name',
          'vendor.avatar': '$vendorInfo.avatar',
          'vendor.isApprovedVendor': '$vendorInfo.isApprovedVendor'
        }
      }
    ];
    
    // Popular products
    const popularPipeline = [
      { $match: matchQuery },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ['$sales', 0.4] },
              { $multiply: ['$averageRating', 20] },
              { $multiply: ['$views', 0.001] },
              { $multiply: ['$totalReviews', 5] },
              { $cond: [{ $eq: ['$isFeatured', true] }, 10, 0] },
              { $cond: [{ $eq: ['$isBestSeller', true] }, 10, 0] }
            ]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 8 },
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
          _id: 1,
          title: 1,
          slug: 1,
          productType: 1,
          category: 1,
          price: 1,
          salePrice: 1,
          discountPercent: 1,
          thumbnailUrl: 1,
          averageRating: 1,
          totalReviews: 1,
          sales: 1,
          views: 1,
          isFeatured: 1,
          isBestSeller: 1,
          isVerified: 1,
          isPremium: 1,
          isNew: 1,
          popularityScore: 1,
          createdAt: 1,
          'vendor._id': '$vendorInfo._id',
          'vendor.name': '$vendorInfo.name',
          'vendor.avatar': '$vendorInfo.avatar',
          'vendor.isApprovedVendor': '$vendorInfo.isApprovedVendor'
        }
      }
    ];
    
    const [featuredProducts, popularProducts] = await Promise.all([
      (Product as any).aggregate(featuredPipeline),
      (Product as any).aggregate(popularPipeline)
    ]);
    
    console.log('Featured count:', featuredProducts.length);
    console.log('Popular count:', popularProducts.length);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          featuredProducts,
          popularProducts
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Home API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get home data' },
      { status: 500 }
    );
  }
}