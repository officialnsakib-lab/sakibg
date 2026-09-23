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
            totalSales: user.totalSales || 0,
            totalEarnings: user.totalEarnings || 0,
            pendingEarnings: user.pendingEarnings || 0,
            withdrawnEarnings: user.withdrawnEarnings || 0, // ✅ Add
            totalProducts: user.totalProducts || 0, // ✅ Add
            totalWebsiteDemos: user.totalWebsiteDemos || 0, // ✅ Add
            activeProducts: user.activeProducts || 0, // ✅ Add
            activeWebsiteDemos: user.activeWebsiteDemos || 0, // ✅ Add
            pendingProducts: user.pendingProducts || 0, // ✅ Add
            pendingWebsiteDemos: user.pendingWebsiteDemos || 0, // ✅ Add
            averageRating: user.averageRating || 0, // ✅ Add
            totalReviews: user.totalReviews || 0, // ✅ Add
            isBanned: user.isBanned || false,    // ✅ Add
            isActive: user.isActive || true,      // ✅ Add
            avatar: user.avatar,
            bio: user.bio,
            pendingIncome: user.pendingIncome || 0,
            pendingWithdrawal: user.pendingWithdrawal || 0,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
            website: user.website, // ✅ Add
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