import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await (User as any).findById(decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Only vendors can upload' },
        { status: 403 }
      );
    }
    
    // ক্লায়েন্ট থেকে পাঠানো JSON বডি রিসিভ করা হচ্ছে
    const body = await req.json();
    
    const {
      title,
      description,
      shortDescription,
      productType,
      category,
      subCategory,
      price,
      salePrice,
      tags,
      features,
      requirements,
      demoUrl,
      videoUrl,
      version,
      documentation,
      stockQuantity,
      sku,
      weight,
      dimensions,
      // Website specific fields
      websiteType,
      technologies,
      pages,
      includes,
      supportIncluded,
      supportDuration,
      updatesIncluded,
      isAdsenseApproved,
      // Premium & Media URLs
      isPremium,
      fileUrl,
      thumbnailUrl,
      images,
      // SEO fields
      metaTitle,
      metaDescription,
      keywords
    } = body;
    
    // প্রয়োজনীয় ফিল্ডগুলোর ভ্যালিডেশন
    if (!title || !description || !category || price === undefined || isNaN(price) || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled (Title, Description, Category, Price, and File)' },
        { status: 400 }
      );
    }
    
    // ডিসকাউন্ট পার্সেন্টেজ হিসাব করা
    let discountPercent = 0;
    if (salePrice !== null && salePrice !== undefined && salePrice < price) {
      discountPercent = Math.round(((price - salePrice) / price) * 100);
    }
    
    // ডাটাবেজে প্রোডাক্ট তৈরি করা (কোনো ফিচার বাদ দেওয়া হয়নি)
    const product = await (Product as any).create({
      vendorId: user._id,
      title,
      description,
      shortDescription: shortDescription || null,
      productType: productType || 'digital',
      category,
      subCategory: subCategory || null,
      price,
      salePrice: salePrice || null,
      discountPercent,
      tags: tags || [],
      features: features || [],
      requirements: requirements || [],
      demoUrl: demoUrl || null,
      videoUrl: videoUrl || null,
      version: version || '1.0.0',
      documentation: documentation || null,
      stock: productType === 'physical' ? (stockQuantity || 0) : 0,
      sku: sku || null,
      weight: weight || null,
      dimensions: dimensions || null,
      // Website specific
      websiteType: productType === 'website' ? websiteType : null,
      technologies: technologies || [],
      pages: pages || [],
      includes: includes || [],
      supportIncluded: supportIncluded || false,
      supportDuration: supportDuration || null,
      updatesIncluded: updatesIncluded || false,
      isAdsenseApproved: isAdsenseApproved || false,
      // Premium & Media
      isPremium: isPremium || false,
      fileUrl,
      thumbnailUrl: thumbnailUrl || null,
      images: images || [], // গ্যালারি ইমেজগুলোর URL লিস্ট
      // SEO
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription || description.substring(0, 160),
      keywords: keywords || tags || [],
      status: 'pending',
      isNew: true
    });
    
    // ভেন্ডরের স্ট্যাটাস আপডেট করা
    user.totalProducts = (user.totalProducts || 0) + 1;
    user.pendingProducts = (user.pendingProducts || 0) + 1;
    await user.save();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Product submitted for approval',
        data: { product }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Product upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}