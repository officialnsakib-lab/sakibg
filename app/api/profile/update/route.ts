import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

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
    const { name, phone, address, city, country, bio, website } = body;
    
    const user = await (User as any).findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    
    await user.save();
    
    return NextResponse.json(
      { success: true, message: 'Profile updated' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}