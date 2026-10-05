import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import mongoose from 'mongoose';

// উইশলিস্ট ফেচ করা (GET)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); 

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // সেফটি চেক: স্ট্রিং বা ObjectId উভয় ফরম্যাটেই কুয়েরি করা
    const queryUserId = new mongoose.Types.ObjectId(userId);
    const wishlist = await Wishlist.find({ userId: queryUserId }).populate('productId').lean();
    
    return NextResponse.json({ success: true, data: wishlist || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Wishlist GET Error:', error);
    // অ্যাপ যেন ক্রাশ না করে, তাই 500 এর পরিবর্তে সাকসেস সহ খালি অ্যারে রিটার্ন করা হচ্ছে
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }
}

// উইশলিস্টে প্রডাক্ট যোগ করা (POST)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return NextResponse.json({ success: false, error: 'User ID and Product ID are required' }, { status: 400 });
    }

    const queryUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const queryProductId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : productId;

    const existingItem = await Wishlist.findOne({ userId: queryUserId, productId: queryProductId });
    if (existingItem) {
      await Wishlist.findByIdAndDelete(existingItem._id);
      return NextResponse.json({ success: true, message: 'Removed from wishlist', action: 'removed' });
    }

    const newItem = await Wishlist.create({ userId: queryUserId, productId: queryProductId });
    return NextResponse.json({ success: true, message: 'Added to wishlist', action: 'added', data: newItem });
  } catch (error: any) {
    console.error('Wishlist POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// উইশলিস্ট থেকে ডিলিট করা (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid Item ID is required' }, { status: 400 });
    }

    await Wishlist.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Item removed successfully' });
  } catch (error: any) {
    console.error('Wishlist DELETE Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}