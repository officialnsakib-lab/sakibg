// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import mongoose from 'mongoose';

// ১. নির্দিষ্ট অর্ডারের বিস্তারিত (কাস্টমার ইনফরমেশন সহ) পাওয়ার GET মেথড
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await (Order as any).findById(id);
    }
    if (!order) {
      order = await (Order as any).findOne({ orderId: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// ২. অর্ডার স্ট্যাটাস আপডেট এবং ভেন্ডর ব্যালেন্স যোগ করার PATCH মেথড
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    console.log("👉 Update Request Body:", body);

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await (Order as any).findById(id);
    }
    if (!order) {
      order = await (Order as any).findOne({ orderId: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.orderStatus) order.orderStatus = body.orderStatus;

    // Case-insensitive চেক (ছোট বা বড় হাতের অক্ষর হলেও ম্যাচ করবে)
    const currentOrderStatus = (order.orderStatus || '').toLowerCase();
    const currentPaymentStatus = (order.paymentStatus || '').toLowerCase();

    const isNowCompleted = 
      currentOrderStatus === 'completed' || 
      currentOrderStatus === 'delivered' || 
      currentPaymentStatus === 'completed' || 
      currentPaymentStatus === 'paid';

    console.log("👉 Is Order Completed?:", isNowCompleted);
    console.log("👉 Order Already Credited?:", order.vendorCredited);

    // 🚀 ব্যালেন্স যোগ করার লজিক
    if (isNowCompleted && !order.vendorCredited) {
      console.log("👉 Order Items Found:", order.items);

      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          
          const vendorId = item.vendorId || item.vendor || item.sellerId || item.user || order.vendorId || order.vendor;
          
          console.log("👉 Found Vendor ID for item:", vendorId);

          if (vendorId) {
            const itemAmount = (item.price || 0) * (item.quantity || 1);
            const vendorEarning = itemAmount; // কমিশন ছাড়াই পুরোটা যোগ হবে

            console.log(`👉 Adding ${vendorEarning} balance to Vendor: ${vendorId}`);

            // User মডেল থেকে ভেন্ডরের ব্যালেন্স আপডেট
            const updatedVendor = await (User as any).findByIdAndUpdate(
              vendorId,
              {
                $inc: {
                  balance: vendorEarning,
                  totalEarnings: vendorEarning,
                  totalSales: item.quantity || 1
                }
              },
              { new: true }
            );

            console.log("👉 Updated Vendor Profile Result:", updatedVendor ? "Success" : "Failed (Vendor not found in User collection)");
          } else {
            console.log("❌ Warning: No Vendor ID found inside item or order!");
          }
        }
      }

      order.vendorCredited = true;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

// ৩. অর্ডার ডিলিট করার DELETE মেথড
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await (Order as any).findByIdAndDelete(id);
    }
    if (!order) {
      order = await (Order as any).findOneAndDelete({ orderId: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}