// app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendEmail, getOtpEmailTemplate } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
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
    
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      );
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Wahisnova',
      html: getOtpEmailTemplate(user.name, otp)
    });
    
    return NextResponse.json(
      { success: true, message: 'New OTP sent to your email' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend' },
      { status: 500 }
    );
  }
}