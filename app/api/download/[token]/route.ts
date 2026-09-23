// app/api/download/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    
    const { token } = await params;
    
    // Check authentication
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Find order by download token
    const order = await (Order as any).findOne({
      downloadToken: token,
      buyerId: decoded.userId
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Invalid download link' },
        { status: 404 }
      );
    }
    
    // Check if order is paid/completed
    if (order.paymentStatus !== 'paid' && order.orderStatus !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Payment not verified yet' },
        { status: 403 }
      );
    }
    
    // Check download expiry
    if (order.downloadExpiry && new Date(order.downloadExpiry) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Download link expired' },
        { status: 403 }
      );
    }
    
    // Get product file
    const product = await (Product as any).findById(order.productId);
    
    if (!product || !product.fileUrl) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Update download count
    order.downloadCount += 1;
    await order.save();
    
    // Update product downloads
    product.downloads += 1;
    await product.save();
    
    // Redirect to file URL
    return NextResponse.redirect(product.fileUrl);
    
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Download failed' },
      { status: 500 }
    );
  }
}