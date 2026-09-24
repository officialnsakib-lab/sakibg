import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

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
    
    const formData = await req.formData();
    
    // Required fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    
    // Fixed price parsing to properly handle '0' (free products) and NaN
    const rawPrice = formData.get('price');
    const price = rawPrice !== null && rawPrice !== '' ? parseFloat(rawPrice as string) : NaN;
    
    const productType = (formData.get('productType') as string) || 'digital';
    const file = formData.get('file') as File;
    
    // Optional fields
    const shortDescription = formData.get('shortDescription') as string;
    const subCategory = formData.get('subCategory') as string;
    const rawSalePrice = formData.get('salePrice');
    const salePrice = rawSalePrice !== null && rawSalePrice !== '' ? parseFloat(rawSalePrice as string) : null;
    
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const features = (formData.get('features') as string)?.split(',').map(f => f.trim()).filter(Boolean) || [];
    const requirements = (formData.get('requirements') as string)?.split(',').map(r => r.trim()).filter(Boolean) || [];
    const demoUrl = formData.get('demoUrl') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const version = formData.get('version') as string || '1.0.0';
    const documentation = formData.get('documentation') as string;
    
    // Physical Product specific fields
    const rawStock = formData.get('stockQuantity');
    const stockQuantity = rawStock !== null && rawStock !== '' ? parseInt(rawStock as string) : 0;
    const sku = formData.get('sku') as string;
    const weight = formData.get('weight') as string;
    const dimensions = formData.get('dimensions') as string;

    // Website specific
    const websiteType = formData.get('websiteType') as string;
    const technologies = (formData.get('technologies') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const pages = (formData.get('pages') as string)?.split(',').map(p => p.trim()).filter(Boolean) || [];
    const includes = (formData.get('includes') as string)?.split(',').map(i => i.trim()).filter(Boolean) || [];
    const supportIncluded = formData.get('supportIncluded') === 'true';
    const supportDuration = formData.get('supportDuration') as string;
    const updatesIncluded = formData.get('updatesIncluded') === 'true';
    const isAdsenseApproved = formData.get('isAdsenseApproved') === 'true';
    
    // Premium
    const isPremium = formData.get('isPremium') === 'true';
    
    // SEO
    const metaTitle = formData.get('metaTitle') as string || title;
    const metaDescription = formData.get('metaDescription') as string || shortDescription || (description ? description.substring(0, 160) : '');
    const keywords = (formData.get('keywords') as string)?.split(',').map(k => k.trim()).filter(Boolean) || tags;
    
    // Thumbnail
    const thumbnail = formData.get('thumbnail') as File;
    
    // Updated Validation
    if (!title || !description || !category || isNaN(price) || !file) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled (Title, Description, Category, Price, and File)' },
        { status: 400 }
      );
    }
    
    // Upload file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileUpload = await cloudinary.uploader.upload(
      `data:${file.type};base64,${fileBuffer.toString('base64')}`,
      { folder: `wahisnova/${productType}/files`, resource_type: 'auto' }
    );
    
    // Upload thumbnail
    let thumbnailUpload = null;
    if (thumbnail && thumbnail.size > 0) {
      const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
      thumbnailUpload = await cloudinary.uploader.upload(
        `data:${thumbnail.type};base64,${thumbBuffer.toString('base64')}`,
        { folder: `wahisnova/${productType}/thumbnails` }
      );
    }
    
    // Calculate discount
    let discountPercent = 0;
    if (salePrice !== null && salePrice < price) {
      discountPercent = Math.round(((price - salePrice) / price) * 100);
    }
    
    // Create product
    const product = await (Product as any).create({
      vendorId: user._id,
      title,
      description,
      shortDescription: shortDescription || null,
      productType,
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
      version,
      documentation: documentation || null,
      // Physical product fields mapping (updated 'stock' instead of 'stockQuantity')
      stock: productType === 'physical' ? stockQuantity : 0,
      sku: sku || null,
      weight: weight || null,
      dimensions: dimensions || null,
      // Website specific
      websiteType: productType === 'website' ? websiteType : null,
      technologies,
      pages,
      includes,
      supportIncluded,
      supportDuration: supportDuration || null,
      updatesIncluded,
      isAdsenseApproved,
      isPremium,
      fileUrl: fileUpload.secure_url,
      fileId: fileUpload.public_id,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileFormat: fileUpload.format,
      thumbnailUrl: thumbnailUpload?.secure_url || null,
      thumbnailId: thumbnailUpload?.public_id || null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription || description.substring(0, 160),
      keywords: keywords || tags,
      status: 'pending',
      isNew: true
    });
    
    // Update vendor stats
    user.totalProducts += 1;
    user.pendingProducts += 1;
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