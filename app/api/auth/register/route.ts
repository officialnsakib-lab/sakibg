// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { sendEmail, getOtpEmailTemplate } from '@/lib/email';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Check registration allowed
    const settings = await (Settings as any).findOne();
    if (settings && settings.allowRegistration === false) {
      return NextResponse.json(
        { success: false, error: 'Registration is currently disabled' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { name, email, password, role, vendorType } = body;
    
    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must include uppercase, lowercase, and number' },
        { status: 400 }
      );
    }
    
    if (role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin registration not allowed' },
        { status: 403 }
      );
    }
    
    if (role && !['customer', 'vendor'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Check existing user
    const existingUser = await (User as any).findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingUser) {
      // If user exists but not verified, resend OTP
      if (!existingUser.isEmailVerified) {
        const newOtp = generateOTP();
        const newOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        existingUser.emailVerificationOTP = newOtp;
        existingUser.emailVerificationExpires = newOtpExpires;
        await existingUser.save();
        
        await sendEmail({
          to: existingUser.email,
          subject: 'Verify Your Email - Wahisnova',
          html: getOtpEmailTemplate(existingUser.name, newOtp)
        });
        
        return NextResponse.json(
          {
            success: true,
            message: 'New verification code sent to your email',
            data: {
              email: existingUser.email,
              userId: existingUser._id,
              requiresVerification: true
            }
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user (unverified)
    const user = await (User as any).create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'customer',
      vendorType: role === 'vendor' ? vendorType : null,
      isApprovedVendor: role === 'vendor' ? false : true,
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpires
    });
    
    // Send OTP email
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Wahisnova',
      html: getOtpEmailTemplate(user.name, otp)
    });
    
    if (!emailResult.success) {
      // If email fails, delete user
      await (User as any).findByIdAndDelete(user._id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Try again.' },
        { status: 500 }
      );
    }
    
    // Return success (don't auto-login until verified)
    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email',
        data: {
          email: user.email,
          userId: user._id,
          requiresVerification: true
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}