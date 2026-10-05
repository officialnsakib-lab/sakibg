import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'momlcc6a',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// বাফার ক্লাউডিনারিতে আপলোড করার হেল্পার ফাংশন
const uploadBufferToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'vendor-products' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

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
    
    // ফ্রন্টএন্ড থেকে পাঠানো FormData রিসিভ করা হচ্ছে
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const category = formData.get('category') as string;
    const subCategory = formData.get('subCategory') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : NaN;
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : null;
    
    const tagsInput = formData.get('tags') as string;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
    
    const stockQuantity = formData.get('stockQuantity') ? parseInt(formData.get('stockQuantity') as string) : 0;
    const sku = formData.get('sku') as string;
    const weight = formData.get('weight') as string;
    const dimensions = formData.get('dimensions') as string;
    const isPremium = formData.get('isPremium') === 'true';

    // ১. মূল প্রোডাক্ট ইমেজ (Thumbnail) ক্লাউডিনারিতে আপলোড
    let thumbnailUrl = '';
    const thumbnailObj = formData.get('thumbnail') as File | null;
    if (thumbnailObj && typeof thumbnailObj === 'object' && thumbnailObj.size > 0) {
      const bytes = await thumbnailObj.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadBufferToCloudinary(buffer);
      thumbnailUrl = uploadRes.secure_url;
    }

    // ২. গ্যালারি ইমেজগুলো ক্লাউডিনারিতে আপলোড
    const galleryFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    for (const imgFile of galleryFiles) {
      if (imgFile && typeof imgFile === 'object' && imgFile.size > 0) {
        const bytes = await imgFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadRes = await uploadBufferToCloudinary(buffer);
        imageUrls.push(uploadRes.secure_url);
      }
    }
    
    // ভ্যালিডেশন
    if (!title || !description || !category || isNaN(price) || !thumbnailUrl) {
      return NextResponse.json(
        { success: false, error: 'All required fields (Title, Description, Category, Price, and Main Image) must be filled.' },
        { status: 400 }
      );
    }
    
    // ডিসকাউন্ট পার্সেন্টেজ হিসাব
    let discountPercent = 0;
    if (salePrice !== null && !isNaN(salePrice) && salePrice < price) {
      discountPercent = Math.round(((price - salePrice) / price) * 100);
    }
    
    // ডাটাবেজে প্রোডাক্ট সেভ করা
    const product = await (Product as any).create({
      vendorId: user._id,
      title,
      description,
      shortDescription: shortDescription || null,
      productType: 'physical',
      category,
      subCategory: subCategory || null,
      price,
      salePrice: salePrice || null,
      discountPercent,
      tags,
      stock: stockQuantity || 0,
      sku: sku || null,
      weight: weight || null,
      dimensions: dimensions || null,
      isPremium,
      fileUrl: null,
      thumbnailUrl,
      images: imageUrls,
      metaTitle: title,
      metaDescription: shortDescription || description.substring(0, 160),
      keywords: tags,
      status: 'pending',
      isNew: true
    });
    
    // ভেন্ডরের স্ট্যাটাস আপডেট
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
    console.error('Product upload backend error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}