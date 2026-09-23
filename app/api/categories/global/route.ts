import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    // মেইন ক্যাটাগরিগুলো ফেচ করার সময় `as any` যোগ করা হয়েছে
    const mainCategories = await Category.find({ parentCategory: null, isActive: true } as any).lean();

    // প্রতিটা মেইন ক্যাটাগরির বিপরীতে সাব-ক্যাটাগরিগুলো খুঁজে বের করা
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (cat: any) => {
        const subCategories = await Category.find({ parentCategory: cat._id, isActive: true } as any).lean();
        return {
          ...cat,
          subCategories
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithSubs
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching global categories:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}