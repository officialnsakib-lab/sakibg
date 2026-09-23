import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { setTokenCookie, setUserCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Rate limiting check
    const loginAttempts = req.cookies.get('login_attempts')?.value;
    if (loginAttempts) {
      const attempts = JSON.parse(loginAttempts);
      if (attempts.count >= 5 && Date.now() - attempts.timestamp < 15 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: 'Too many attempts. Try again after 15 minutes.' },
          { status: 429 }
        );
      }
    }
    
    const user = await (User as any).findOne({ email: email.toLowerCase().trim() }).select('+password');
    // Email verified check (after password check)
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please verify your email first',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      );
    }
    
    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: 'Account is banned' },
        { status: 403 }
      );
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id.toString(), user.role);
    
    // Set HttpOnly cookie
    await setTokenCookie(token);
    
    const userData = {
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
      activeProducts: user.activeProducts || 0, // ✅ Add
      pendingProducts: user.pendingProducts || 0, // ✅ Add
      averageRating: user.averageRating || 0, // ✅ Add
      totalReviews: user.totalReviews || 0, // ✅ Add
      isBanned: false,           // ✅ Add
      isActive: true,            // ✅ Add
      avatar: user.avatar,
      pendingIncome: user.pendingIncome || 0,
      pendingWithdrawal: user.pendingWithdrawal || 0,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      website: user.website, // ✅ Add
      isEmailVerified: user.isEmailVerified || false
    };
    
    // Set user cookie (non-httpOnly for client)
    await setUserCookie(userData);
    
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: { user: userData }
      },
      { status: 200 }
    );
    
    return response;
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}