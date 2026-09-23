// app/api/admin/process-withdrawal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Check admin authentication
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { withdrawalId, action, rejectionReason, transactionId } = body;
    
    if (!withdrawalId || !action) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal ID and action required' },
        { status: 400 }
      );
    }
    
    // Find withdrawal
    const withdrawal = await (Withdrawal as any).findById(withdrawalId);
    
    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }
    
    // Check if already processed
    if (withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: `Withdrawal already ${withdrawal.status}` },
        { status: 400 }
      );
    }
    
    // Find vendor
    const vendor = await (User as any).findById(withdrawal.vendorId);
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }
    
    const amount = withdrawal.amount;
    
    // ============ APPROVE WITHDRAWAL ============
// ============ APPROVE WITHDRAWAL ============
    if (action === 'approve') {
      withdrawal.status = 'completed';
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = decoded.userId;
      withdrawal.transactionId = transactionId || null;
      await withdrawal.save();
      
      // ✅ Correct balance update
      // 1. totalEarnings = NO change (total থাকবে)
      // 2. withdrawnEarnings += amount
      // 3. pendingWithdrawal -= amount
      vendor.withdrawnEarnings = (vendor.withdrawnEarnings || 0) + amount;
      vendor.pendingWithdrawal = Math.max(0, (vendor.pendingWithdrawal || 0) - amount);
      await vendor.save();
    }
    
    // ============ REJECT WITHDRAWAL ============
    if (action === 'reject') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason required' },
          { status: 400 }
        );
      }
      
      // Update withdrawal status
      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = rejectionReason.trim();
      await withdrawal.save();
      
      // ✅ Refund frozen amount
      // pendingWithdrawal থেকে বাদ দিন, totalEarnings এ ফিরিয়ে দিন
      vendor.pendingWithdrawal = Math.max(0, (vendor.pendingWithdrawal || 0) - amount);
      
      // Note: totalEarnings থেকে কাটা হয়নি, তাই ফেরত দেওয়ার দরকার নেই
      // শুধু freeze তুলে নিন
      
      await vendor.save();
      
      console.log('✅ Withdrawal rejected and amount refunded:', {
        vendorId: vendor._id,
        amount: amount,
        totalEarnings: vendor.totalEarnings,
        pendingWithdrawal: vendor.pendingWithdrawal
      });
      
      return NextResponse.json(
        {
          success: true,
          message: 'Withdrawal rejected, amount refunded to available balance',
          data: {
            withdrawal: {
              withdrawalId: withdrawal.withdrawalId,
              status: withdrawal.status,
              rejectionReason: withdrawal.rejectionReason
            },
            vendor: {
              totalEarnings: vendor.totalEarnings,
              withdrawnEarnings: vendor.withdrawnEarnings,
              pendingWithdrawal: vendor.pendingWithdrawal
            }
          }
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}