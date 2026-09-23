// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication
    const decoded = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Login required to purchase' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { productId, productType, paymentMethod, transactionId, senderNumber } = body;
    
    // Validate
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    // Get product
    const product = await (Product as any).findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check product status
    if (product.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Product not available for purchase' },
        { status: 400 }
      );
    }
    
    // Check if buyer is vendor himself
    if (product.vendorId.toString() === decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }
    
    // Get buyer and vendor
    const [buyer, vendor] = await Promise.all([
      (User as any).findById(decoded.userId),
      (User as any).findById(product.vendorId)
    ]);
    
    if (!buyer || !vendor) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate price
    const finalPrice = product.salePrice || product.price;
    const originalPrice = product.price;
    const discountAmount = originalPrice - finalPrice;
    
    // Calculate commission
    const commissionRate = vendor.commissionRate || 10;
    const commissionAmount = (finalPrice * commissionRate) / 100;
    const vendorAmount = finalPrice - commissionAmount;
    
    // Create order
    const order = await (Order as any).create({
      buyerId: buyer._id,
      vendorId: vendor._id,
      productType: product.productType || 'digital',
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug || product.title.toLowerCase().replace(/\s+/g, '-'),
      price: finalPrice,
      originalPrice: originalPrice,
      discountAmount: discountAmount,
      currency: 'USD',
      commissionRate: commissionRate,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      vendorAmount: Math.round(vendorAmount * 100) / 100,
      paymentStatus: 'pending', // Admin verify করবে
      paymentMethod: paymentMethod || 'bkash',
      paymentId: transactionId || null,
      senderNumber: senderNumber || null,
      orderStatus: 'pending',
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      vendorName: vendor.name,
      vendorEmail: vendor.email
    });
    
      // ✅ Add to vendor pendingIncome
      vendor.pendingIncome = (vendor.pendingIncome || 0) + vendorAmount;
      await vendor.save();
    return NextResponse.json(
      {
        success: true,
        message: 'Order created! Waiting for payment verification',
        data: {
          order: {
            _id: order._id,
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            downloadToken: order.downloadToken
          }
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Order create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed' },
      { status: 500 }
    );
  }
}