import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; // এখানে অবশ্যই { connectDB } হতে হবে
import Wishlist from '@/models/Wishlist';

// উইশলিস্ট ফেচ করা (GET)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); 

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const wishlist = await Wishlist.find({ userId }).populate('productId');
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      await Wishlist.findByIdAndDelete(existingItem._id);
      return NextResponse.json({ success: true, message: 'Removed from wishlist', action: 'removed' });
    }

    const newItem = await Wishlist.create({ userId, productId });
    return NextResponse.json({ success: true, message: 'Added to wishlist', action: 'added', data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// উইশলিস্ট থেকে ডিলিট করা (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    await Wishlist.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Item removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}