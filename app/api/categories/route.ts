import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ১. প্রথমে মূল Category কালেকশন থেকে ক্যাটাগরিগুলো আনা
    let mainCategories: any[] = [];
    try {
      mainCategories = await Category.find({ isActive: true } as any).lean();
    } catch (e) {
      // মডেল না থাকলে ক্রাশ না করে ইগ্নোর করবে
      mainCategories = [];
    }

    // ২. প্রোডাক্ট কালেকশন থেকে এপ্রুভড প্রোডাক্টগুলোর ইউনিক ক্যাটাগরি ও প্রোডাক্ট কাউন্ট বের করা
    const productCategories = await (Product as any).aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ৩. দুটি সোর্স এক করে একটি ইউনিক ক্যাটাগরি লিস্ট তৈরি করা
    const categoryMap = new Map();

    // প্রথমে প্রোডাক্টের ক্যাটাগরিগুলো যুক্ত করা (যাতে রিয়েল-টাইম কাউন্ট ও কাস্টম ক্যাটাগরি মিস না হয়)
    productCategories.forEach((item: any) => {
      if (item._id) {
        const rawName = item._id.toString().trim();
        const slug = rawName.toLowerCase().replace(/\s+/g, '-');
        const displayName = rawName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        categoryMap.set(slug, {
          _id: slug,
          name: displayName,
          slug: slug,
          type: 'physical',
          productCount: item.count,
          subCategories: []
        });
      }
    });

    // এরপর Category মডেলের ক্যাটাগরিগুলো মার্জ করা
    mainCategories.forEach((cat: any) => {
      if (cat.name || cat.slug) {
        const slug = (cat.slug || cat.name).toLowerCase().replace(/\s+/g, '-');
        if (!categoryMap.has(slug)) {
          categoryMap.set(slug, {
            _id: cat._id.toString(),
            name: cat.name,
            slug: slug,
            type: 'physical',
            productCount: 0,
            subCategories: cat.subCategories || []
          });
        }
      }
    });

    const finalCategoriesList = Array.from(categoryMap.values());

    return NextResponse.json({
      success: true,
      data: finalCategoriesList
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching global categories:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}