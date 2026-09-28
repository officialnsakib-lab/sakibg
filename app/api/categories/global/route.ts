import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    // মেইন ক্যাটাগরিগুলো ফেচ করা
    const mainCategories = await Category.find({ parentCategory: null, isActive: true } as any).lean();

    // প্রতিটা মেইন ক্যাটাগরির বিপরীতে সাব-ক্যাটাগরিগুলো খুঁজে বের করা এবং টাইপ নির্ধারণ করা
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (cat: any) => {
        const subCategories = await Category.find({ parentCategory: cat._id, isActive: true } as any).lean();
        
        // যদি ডাটাবেজে আলাদা type ফিল্ড না থাকে, তবে নাম বা স্লাগ দেখে স্বয়ংক্রিয়ভাবে type নির্ধারণ করে দিতে পারেন
        let categoryType = cat.type;
        if (!categoryType) {
          const lowerName = cat.name.toLowerCase();
          const lowerSlug = cat.slug.toLowerCase();
          if (lowerName.includes('digital') || lowerSlug.includes('digital')) {
            categoryType = 'digital';
          } else {
            categoryType = 'physical';
          }
        }

        return {
          ...cat,
          type: categoryType, // ফ্রন্টএন্ডে ফিল্টার করার জন্য type যুক্ত করা হলো
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