// app/api/admin/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Check admin authentication
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { orderId, action } = body;
    
    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'Order ID and action required' },
        { status: 400 }
      );
    }
    
    // Find order
    const order = await (Order as any).findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Prevent double approval
    if (order.paymentStatus === 'paid' && action === 'approve') {
      return NextResponse.json(
        { success: false, error: 'Order already approved' },
        { status: 400 }
      );
    }
    
    // ============ APPROVE PAYMENT ============
    // Approve হলে:
    if (action === 'approve') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'completed';
      order.paymentDate = new Date();
      await order.save();
      
      // Product stats
      const product = await (Product as any).findById(order.productId);
      if (product) {
        product.sales = (product.sales || 0) + 1;
        product.revenue = (product.revenue || 0) + order.price;
        await product.save();
      }
      
      // ✅ Vendor earnings update
      const vendor = await (User as any).findById(order.vendorId);
      if (vendor) {
        vendor.totalSales = (vendor.totalSales || 0) + 1;
        
        // ✅ pendingIncome থেকে বাদ
        vendor.pendingIncome = Math.max(0, (vendor.pendingIncome || 0) - order.vendorAmount);
        
        // ✅ totalEarnings এ যোগ
        vendor.totalEarnings = (vendor.totalEarnings || 0) + order.vendorAmount;
        
        await vendor.save();
      }
    }

    // ============ REJECT PAYMENT ============
    // Reject হলে:
    if (action === 'reject') {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      
      // ✅ pendingIncome থেকে বাদ
      const vendor = await (User as any).findById(order.vendorId);
      if (vendor) {
        vendor.pendingIncome = Math.max(0, (vendor.pendingIncome || 0) - order.vendorAmount);
        await vendor.save();
      }
    }
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}