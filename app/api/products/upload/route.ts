import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// ক্লাউডিনারি কনফিগারেশন (এনভায়রনমেন্ট ভেরিয়েবল বা সরাসরি)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'momlcc6a',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// সার্ভার সাইডে বড় ফাইল (যেমন জিপ ফাইল) ক্লাউডিনারিতে আপলোড করার হেল্পার ফাংশন
const uploadBufferToCloudinary = (buffer: Buffer, resourceType: string = 'auto'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: 'vendor-products' },
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
    
    // JSON এর পরিবর্তে FormData রিসিভ করা হচ্ছে যাতে বড় জিপ ফাইল নিরাপدی প্রসেস করা যায়
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const productType = formData.get('productType') as string;
    const category = formData.get('category') as string;
    const subCategory = formData.get('subCategory') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : NaN;
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : null;
    
    // JSON ফিল্ডগুলো পার্স করার ফাংশন
    const parseJSONField = (fieldValue: any, fallback: any) => {
      if (!fieldValue) return fallback;
      try {
        return JSON.parse(fieldValue);
      } catch {
        return fallback;
      }
    };

    const tags = parseJSONField(formData.get('tags'), []);
    const features = parseJSONField(formData.get('features'), []);
    const requirements = parseJSONField(formData.get('requirements'), []);
    const technologies = parseJSONField(formData.get('technologies'), []);
    const pages = parseJSONField(formData.get('pages'), []);
    const includes = parseJSONField(formData.get('includes'), []);
    const keywords = parseJSONField(formData.get('keywords'), []);

    const demoUrl = formData.get('demoUrl') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const version = formData.get('version') as string;
    const documentation = formData.get('documentation') as string;
    const stockQuantity = formData.get('stockQuantity') ? parseInt(formData.get('stockQuantity') as string) : 0;
    const sku = formData.get('sku') as string;
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null;
    const dimensions = formData.get('dimensions') as string;
    
    const websiteType = formData.get('websiteType') as string;
    const supportIncluded = formData.get('supportIncluded') === 'true';
    const supportDuration = formData.get('supportDuration') as string;
    const updatesIncluded = formData.get('updatesIncluded') === 'true';
    const isAdsenseApproved = formData.get('isAdsenseApproved') === 'true';
    const isPremium = formData.get('isPremium') === 'true';

    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;

    // ১. মেইন প্রোডাক্ট ফাইল (জিপ ফাইল) হ্যান্ডেল করা
    let fileUrl = formData.get('fileUrl') as string;
    const fileObj = formData.get('file') as File | null;
    if (fileObj && typeof fileObj === 'object' && fileObj.size > 0) {
      const bytes = await fileObj.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadBufferToCloudinary(buffer, 'auto');
      fileUrl = uploadRes.secure_url;
    }

    // ২. থাম্বনেইল ইমেজ হ্যান্ডেল করা
    let thumbnailUrl = formData.get('thumbnailUrl') as string;
    const thumbnailObj = formData.get('thumbnail') as File | null;
    if (thumbnailObj && typeof thumbnailObj === 'object' && thumbnailObj.size > 0) {
      const bytes = await thumbnailObj.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadBufferToCloudinary(buffer, 'image');
      thumbnailUrl = uploadRes.secure_url;
    }
    
    // প্রয়োজনীয় ফিল্ডগুলোর ভ্যালিডেশন
    if (!title || !description || !category || isNaN(price) || !fileUrl) {
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
    
    // ডাটাবেজে প্রোডাক্ট তৈরি করা
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
      tags,
      features,
      requirements,
      demoUrl: demoUrl || null,
      videoUrl: videoUrl || null,
      version: version || '1.0.0',
      documentation: documentation || null,
      stock: productType === 'physical' ? (stockQuantity || 0) : 0,
      sku: sku || null,
      weight: weight || null,
      dimensions: dimensions || null,
      websiteType: productType === 'website' ? websiteType : null,
      technologies,
      pages,
      includes,
      supportIncluded,
      supportDuration: supportDuration || null,
      updatesIncluded,
      isAdsenseApproved,
      isPremium,
      fileUrl,
      thumbnailUrl: thumbnailUrl || null,
      images: [], // গ্যালারি ইমেজ প্রয়োজন হলে এখানে হ্যান্ডেল করা যাবে
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription || description.substring(0, 160),
      keywords: keywords.length > 0 ? keywords : tags,
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