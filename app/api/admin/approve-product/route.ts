// app/api/admin/approve-product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Check admin
  const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { productId, action, reason } = body; // action: 'approve' | 'reject'
    
    if (!productId || !action) {
      return NextResponse.json(
        { success: false, error: 'Product ID and action required' },
        { status: 400 }
      );
    }
    
    const product = await (Product as any).findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update product
    if (action === 'approve') {
      product.status = 'approved';
      product.approvedAt = new Date();
      product.approvedBy = decoded.userId;
      product.rejectionReason = null;
      product.isNew = true;
      await product.save();
      
      // Update vendor stats
      const vendor = await (User as any).findById(product.vendorId);
      if (vendor) {
        vendor.pendingProducts = Math.max(0, (vendor.pendingProducts || 1) - 1);
        vendor.activeProducts += 1;
        await vendor.save();
      }
      
      return NextResponse.json(
        { success: true, message: 'Product approved successfully' },
        { status: 200 }
      );
      
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason required' },
          { status: 400 }
        );
      }
      
      product.status = 'rejected';
      product.rejectionReason = reason;
      await product.save();
      
      // Update vendor stats
      const vendor = await (User as any).findById(product.vendorId);
      if (vendor) {
        vendor.pendingProducts = Math.max(0, (vendor.pendingProducts || 1) - 1);
        vendor.rejectedProducts = (vendor.rejectedProducts || 0) + 1;
        await vendor.save();
      }
      
      return NextResponse.json(
        { success: true, message: 'Product rejected' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Approve product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}