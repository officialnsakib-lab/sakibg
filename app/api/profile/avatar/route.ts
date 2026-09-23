// app/api/profile/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

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
    
    const formData = await req.formData();
    const avatar = formData.get('avatar') as File;
    
    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar file required' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Avatar must be less than 5MB' },
        { status: 400 }
      );
    }
    
    const user = await (User as any).findById(decoded.userId);
    
    // Delete old avatar
    if (user.avatarId) {
      await cloudinary.uploader.destroy(user.avatarId);
    }
    
    // Upload new avatar
    const buffer = Buffer.from(await avatar.arrayBuffer());
    const upload = await cloudinary.uploader.upload(
      `data:${avatar.type};base64,${buffer.toString('base64')}`,
      { folder: 'wahisnova/avatars' }
    );
    
    // Update user
    user.avatar = upload.secure_url;
    user.avatarId = upload.public_id;
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Avatar updated',
        data: { avatar: upload.secure_url }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}