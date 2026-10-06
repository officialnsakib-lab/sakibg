// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
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
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            vendorType: user.vendorType,
            isApprovedVendor: user.isApprovedVendor,
            commissionRate: user.commissionRate,
            tokens: user.tokens || 0, // ✅ টোকেন ব্যালেন্স যুক্ত করা হলো
            hasClaimedToken: user.hasClaimedToken || false, // ✅ ক্লেইম স্ট্যাটাস যুক্ত করা হলো
            totalSales: user.totalSales || 0,
            totalEarnings: user.totalEarnings || 0,
            pendingEarnings: user.pendingEarnings || 0,
            withdrawnEarnings: user.withdrawnEarnings || 0,
            totalProducts: user.totalProducts || 0,
            totalWebsiteDemos: user.totalWebsiteDemos || 0,
            activeProducts: user.activeProducts || 0,
            activeWebsiteDemos: user.activeWebsiteDemos || 0,
            pendingProducts: user.pendingProducts || 0,
            pendingWebsiteDemos: user.pendingWebsiteDemos || 0,
            averageRating: user.averageRating || 0,
            totalReviews: user.totalReviews || 0,
            isBanned: user.isBanned || false,
            isActive: user.isActive || true,
            avatar: user.avatar,
            bio: user.bio,
            pendingIncome: user.pendingIncome || 0,
            pendingWithdrawal: user.pendingWithdrawal || 0,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
            website: user.website,
            isEmailVerified: user.isEmailVerified || false,
            createdAt: user.createdAt
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}