import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
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
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    const user = await (User as any).findById(decoded.userId).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Update password (model pre hook will hash)
    user.password = newPassword;
    await user.save();
    
    return NextResponse.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}