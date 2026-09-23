import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // ✅ Get admin from cookie
    const decoded = await getUserFromCookie();
    
    console.log('Decoded user:', decoded); // Debug
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { vendorId, action } = body;
    
    const vendor = await (User as any).findById(vendorId);
    
    if (!vendor || vendor.role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
      vendor.isApprovedVendor = true;
      vendor.vendorApprovalDate = new Date();
      await vendor.save();
      
      return NextResponse.json(
        { success: true, message: 'Vendor approved' },
        { status: 200 }
      );
    } else if (action === 'ban') {
      vendor.isBanned = true;
      vendor.isActive = false;
      vendor.banReason = 'Banned by admin';
      await vendor.save();
      
      return NextResponse.json(
        { success: true, message: 'Vendor banned' },
        { status: 200 }
      );
    } else if (action === 'unban') {
      vendor.isBanned = false;
      vendor.isActive = true;
      vendor.banReason = null;
      await vendor.save();
      
      return NextResponse.json(
        { success: true, message: 'Vendor unbanned' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Vendor action error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update vendor' },
      { status: 500 }
    );
  }
}