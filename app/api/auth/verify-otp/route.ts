// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { setTokenCookie, setUserCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP required' },
        { status: 400 }
      );
    }
    
    const user = await (User as any).findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check OTP
    if (user.emailVerificationOTP !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }
    
    // Check expiry
    if (new Date(user.emailVerificationExpires) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'OTP expired. Please request new one.' },
        { status: 400 }
      );
    }
    
    // Verify user
    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id.toString(), user.role);
    
    await setTokenCookie(token);
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorType: user.vendorType,
      isApprovedVendor: user.isApprovedVendor,
      isBanned: false,
      isActive: true,
      isEmailVerified: true
    };
    
    await setUserCookie(userData);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully!',
        data: { user: userData }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}