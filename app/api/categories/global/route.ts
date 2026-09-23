import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; // অথবা আপনার প্রজেক্টের সঠিক ফাংশন নাম অনুযায়ী
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB(); // এখানে dbConnect এর বদলে connectDB ব্যবহার করা হলো

    // মেইন ক্যাটাগরিগুলো ফেচ করা (যাদের parentCategory নেই বা null)
    const mainCategories = await Category.find({ parentCategory: null, isActive: true }).lean();

    // প্রতিটা মেইন ক্যাটাগরির বিপরীতে সাব-ক্যাটাগরিগুলো খুঁজে বের করা
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (cat: any) => {
        const subCategories = await Category.find({ parentCategory: cat._id, isActive: true }).lean();
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