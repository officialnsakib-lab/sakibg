// app/api/auth/claim-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded: any = await getUserFromCookie();

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Login required to claim token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id || decoded._id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // চেক করা ইউজার ইতিমধ্যে টোকেন ক্লেইম করেছে কিনা
    if (user.hasClaimedToken) {
      return NextResponse.json(
        { success: false, error: 'You have already claimed your 10% discount token!' },
        { status: 400 }
      );
    }

    // টোকেন যোগ করা এবং ফ্ল্যাগ ট্রু করা (যাতে পুনরায় আর ক্লেইম করতে না পারে)
    user.tokens = (user.tokens || 0) + 1;
    user.hasClaimedToken = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Token claimed successfully! You have received 1 token for 10% discount.',
      tokens: user.tokens
    });

  } catch (error: any) {
    console.error('Claim token error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during claim' },
      { status: 500 }
    );
  }
}