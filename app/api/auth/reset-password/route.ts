// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { token, password } = body;
    
    console.log('🔑 Reset token:', token);
    
    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password required' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await (User as any).findOne({
      resetPasswordToken: token
    });
    
    console.log('👤 User found:', user ? user.email : 'No user');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Check expiry
    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expired. Please request a new one.' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user (avoid pre-save hook)
    await (User as any).findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      { new: true }
    );
    
    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}