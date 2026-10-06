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
    
    const decoded: any = await getUserFromCookie();
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Login required to purchase' },
        { status: 401 }
      );
    }

    const currentUserId = decoded.userId || decoded.id || decoded._id;
    const body = await req.json();
    const { items, productId, shippingAddress, deliveryCharge, paymentMethod, transactionId, senderNumber, useToken } = body;
    
    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items;
    } else if (productId) {
      const product = await (Product as any).findById(productId);
      if (product) {
        orderItems = [{
          productId: product._id,
          quantity: 1,
          price: product.salePrice || product.price,
          vendor: product.vendorId || product.vendor
        }];
      }
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid products in cart' },
        { status: 400 }
      );
    }

    const firstItem = orderItems[0];
    const targetProductId = firstItem.productId || firstItem._id || firstItem.id;

    if (!targetProductId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is missing in request' },
        { status: 400 }
      );
    }

    const product = await (Product as any).findById(targetProductId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found in database' },
        { status: 404 }
      );
    }

    const vendorId = product.vendorId || product.vendor;

    const [buyer, vendor] = await Promise.all([
      (User as any).findById(currentUserId),
      vendorId ? (User as any).findById(vendorId) : null
    ]);
    
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'Buyer account not found' },
        { status: 404 }
      );
    }
    
    let finalPrice = Number(firstItem.price || product.salePrice || product.price) || 0;
    const originalPrice = Number(product.price) || finalPrice;

    // ✅ টোকেন ব্যবহার করলে ১০% ডিসকাউন্ট ক্যালকুলেশন লজিক
    let tokenDiscountApplied = false;
    if (useToken) {
      if ((buyer.tokens || 0) > 0) {
        const discountFromToken = finalPrice * 0.10; // ১০% ডিসকাউন্ট
        finalPrice = Math.max(0, finalPrice - discountFromToken);
        tokenDiscountApplied = true;

        // ইউজারের অ্যাকাউন্ট থেকে ১টি টোকেন কেটে নেওয়া (অথবা আপনার নিয়মে যত কাটতে চান)
        buyer.tokens = Math.max(0, buyer.tokens - 1);
        await buyer.save();
      } else {
        return NextResponse.json(
          { success: false, error: 'You do not have enough tokens for discount' },
          { status: 400 }
        );
      }
    }

    const discountAmount = Math.max(0, originalPrice - finalPrice);
    
    const commissionRate = vendor?.commissionRate || 10;
    const commissionAmount = (finalPrice * commissionRate) / 100;
    const vendorAmount = finalPrice - commissionAmount;

    const customOrderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);
    const isDigital = product.productType === 'digital' || body.productType === 'digital';

    const orderData: any = {
      orderId: customOrderId,
      buyerId: buyer._id,
      vendorId: vendor?._id || buyer._id,
      productType: isDigital ? 'digital' : 'physical',
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug || product.title.toLowerCase().replace(/\s+/g, '-'),
      price: Math.round(finalPrice * 100) / 100,
      originalPrice: originalPrice,
      discountAmount: Math.round(discountAmount * 100) / 100,
      currency: 'BDT',
      commissionRate: commissionRate,
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      vendorAmount: Math.round(vendorAmount * 100) / 100,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'bkash',
      paymentId: transactionId || null,
      senderNumber: senderNumber || null,
      orderStatus: 'pending',
      buyerName: buyer.name || buyer.email.split('@')[0],
      buyerEmail: buyer.email,
      vendorName: vendor?.name || 'Admin Store',
      vendorEmail: vendor?.email || 'admin@wahisnova.com',
      shippingAddress: isDigital ? null : (shippingAddress || null),
      deliveryCharge: isDigital ? 0 : Number(deliveryCharge || 0),
      tokenDiscountUsed: tokenDiscountApplied
    };

    const order = await (Order as any).create(orderData);
    
    if (vendor) {
      vendor.pendingIncome = (vendor.pendingIncome || 0) + vendorAmount;
      await vendor.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully with token discount!',
        data: {
          order: {
            _id: order._id,
            orderId: order.orderId,
            price: order.price,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
          }
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Order creation error details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Order creation failed' },
      { status: 400 }
    );
  }
}