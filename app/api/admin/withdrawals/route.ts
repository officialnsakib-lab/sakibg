// app/api/admin/withdrawals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange') || '30days';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    let query: any = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      let days = 30;
      if (dateRange === '7days') days = 7;
      if (dateRange === '90days') days = 90;
      query.createdAt = { $gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) };
    }
    
    if (search) {
      query.$or = [
        { withdrawalId: { $regex: search, $options: 'i' } },
        { accountNumber: { $regex: search, $options: 'i' } },
        { accountHolderName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [withdrawals, total, statsResult] = await Promise.all([
      (Withdrawal as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('vendorId', 'name email totalEarnings withdrawnEarnings pendingEarnings'),
      (Withdrawal as any).countDocuments(query),
      (Withdrawal as any).aggregate([
        { $match: {} },
        {
          $group: {
            _id: null,
            totalWithdrawals: { $sum: 1 },
            pendingWithdrawals: { 
              $sum: { $cond: [{ $in: ['$status', ['pending', 'processing']] }, 1, 0] } 
            },
            completedWithdrawals: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
            },
            totalWithdrawn: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } 
            },
            pendingAmount: { 
              $sum: { $cond: [{ $in: ['$status', ['pending', 'processing']] }, '$amount', 0] } 
            }
          }
        }
      ])
    ]);
    
    const stats = statsResult[0] || {
      totalWithdrawals: 0,
      pendingWithdrawals: 0,
      completedWithdrawals: 0,
      totalWithdrawn: 0,
      pendingAmount: 0
    };
    
    return NextResponse.json(
      {
        success: true,
        data: {
          withdrawals,
          stats,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get withdrawals' },
      { status: 500 }
    );
  }
}