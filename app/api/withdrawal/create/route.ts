// app/api/withdrawal/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Withdrawal from '@/models/Withdrawal';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { amount, method, accountNumber, accountHolderName } = body;
    
    // Validate
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount required' },
        { status: 400 }
      );
    }
    
    if (!method || !['bkash', 'nagad', 'bank'].includes(method)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method required' },
        { status: 400 }
      );
    }
    
    if (!accountNumber || accountNumber.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Valid account number required' },
        { status: 400 }
      );
    }
    
    if (!accountHolderName || !accountHolderName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account holder name required' },
        { status: 400 }
      );
    }
    
    // Get vendor
    const vendor = await (User as any).findById(decoded.userId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
        { status: 403 }
      );
    }
    
      // ✅ Available balance calculation
      const availableBalance = (vendor.totalEarnings || 0) - (vendor.withdrawnEarnings || 0) - (vendor.pendingWithdrawal || 0);

      if (amount > availableBalance) {
        return NextResponse.json(
          { success: false, error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}` },
          { status: 400 }
        );
      }
    
    // Minimum withdrawal check
    const MIN_WITHDRAWAL = 10;
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` },
        { status: 400 }
      );
    }
    
    // Check pending withdrawal
    const pendingWithdrawal = await (Withdrawal as any).findOne({
      vendorId: vendor._id,
      status: { $in: ['pending', 'processing'] }
    });
    
    if (pendingWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending withdrawal request' },
        { status: 400 }
      );
    }
    
    // ✅ Freeze amount
    vendor.pendingWithdrawal = (vendor.pendingWithdrawal || 0) + amount;
    await vendor.save();
    
    // Create withdrawal
    const withdrawal = await (Withdrawal as any).create({
      vendorId: vendor._id,
      amount,
      method,
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      status: 'pending'
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'Withdrawal request submitted',
        data: {
          withdrawal: {
            withdrawalId: withdrawal.withdrawalId,
            amount: withdrawal.amount,
            status: withdrawal.status
          }
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Withdrawal failed' },
      { status: 500 }
    );
  }
}