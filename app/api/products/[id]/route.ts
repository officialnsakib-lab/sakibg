// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromCookie } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';

// ============ GET SINGLE PRODUCT ============
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise type
) {
  try {
    await connectDB();
    
    const { id } = await params; // ✅ Await params
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    // Increment views
    await (Product as any).findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }
    );
    
    // Get product with vendor info
    const productPipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
          slug: 1,
          description: 1,
          shortDescription: 1,
          productType: 1,
          category: 1,
          subCategory: 1,
          tags: 1,
          price: 1,
          salePrice: 1,
          discountPercent: 1,
          thumbnailUrl: 1,
          images: 1,
          demoUrl: 1,
          videoUrl: 1,
          features: 1,
          requirements: 1,
          stock: 1,
          sku: 1,
          weight: 1,
          dimensions: 1,
          averageRating: 1,
          totalReviews: 1,
          sales: 1,
          views: 1,
          downloads: 1,
          status: 1,
          isFeatured: 1,
          isTrending: 1,
          isBestSeller: 1,
          isNew: 1,
          createdAt: 1,
          'vendor._id': '$vendorInfo._id',
          'vendor.name': '$vendorInfo.name',
          'vendor.avatar': '$vendorInfo.avatar',
          'vendor.bio': '$vendorInfo.bio',
          'vendor.totalSales': '$vendorInfo.totalSales',
          'vendor.averageRating': '$vendorInfo.averageRating'
        }
      }
    ];
    
    const productResult = await (Product as any).aggregate(productPipeline);
    
    if (!productResult || productResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const product = productResult[0];
    
    // Get related products (শুধুমাত্র ফিজিক্যাল প্রোডাক্টের মধ্য থেকে)
    const relatedPipeline = [
      { 
        $match: { 
          status: 'approved',
          productType: 'physical',
          category: product.category,
          _id: { $ne: new mongoose.Types.ObjectId(id) }
        } 
      },
      { $sort: { sales: -1, averageRating: -1 } },
      { $limit: 4 },
      {
        $project: {
          title: 1,
          price: 1,
          salePrice: 1,
          thumbnailUrl: 1,
          averageRating: 1,
          totalReviews: 1,
          sales: 1
        }
      }
    ];
    
    const relatedProducts = await (Product as any).aggregate(relatedPipeline);
    
    return NextResponse.json(
      {
        success: true,
        data: {
          product,
          relatedProducts
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get product' },
      { status: 500 }
    );
  }
}

// ============ UPDATE PRODUCT (PUT) ============
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const decoded: any = await getUserFromCookie();
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    
    const product = await (Product as any).findById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // অথরাইজেশন চেক: অ্যাডমিন অথবা নিজস্ব ভেন্ডর কি না
    if (decoded.role !== 'admin' && product.vendorId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const updateData = {
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription,
      category: body.category,
      subCategory: body.subCategory,
      price: body.price,
      salePrice: body.salePrice,
      tags: body.tags,
      stock: body.stockQuantity !== undefined ? parseInt(body.stockQuantity) : body.stock,
      sku: body.sku,
      weight: body.weight,
      dimensions: body.dimensions,
      isPremium: body.isPremium,
      thumbnailUrl: body.thumbnailUrl,
      images: body.images,
      status: 'pending' // এডিট করার পর অ্যাডমিন রিভিউর জন্য আবার পেন্ডিং করা যেতে পারে
    };

    const updatedProduct = await (Product as any).findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Update failed' }, { status: 500 });
  }
}

// ============ DELETE PRODUCT ============
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // ✅ Get user from cookie
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const product = await (Product as any).findById(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // ✅ Check: Admin OR Product Owner can delete
    if (decoded.role === 'admin') {
      // Admin can delete any product
    } else if (product.vendorId.toString() === decoded.userId) {
      // Vendor can delete own product
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Delete files from Cloudinary if needed
    if (product.fileId) {
      await deleteFromCloudinary(product.fileId);
    }
    if (product.thumbnailId) {
      await deleteFromCloudinary(product.thumbnailId);
    }
    
    await (Product as any).findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}