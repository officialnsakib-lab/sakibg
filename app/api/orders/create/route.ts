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
    const { items, productId, shippingAddress, deliveryCharge, paymentMethod, transactionId, senderNumber } = body;
    
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
    
    const finalPrice = Number(firstItem.price || product.salePrice || product.price) || 0;
    const originalPrice = Number(product.price) || finalPrice;
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
      price: finalPrice,
      originalPrice: originalPrice,
      discountAmount: discountAmount,
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
      deliveryCharge: isDigital ? 0 : Number(deliveryCharge || 0)
    };

    const order = await (Order as any).create(orderData);
    
    if (vendor) {
      vendor.pendingIncome = (vendor.pendingIncome || 0) + vendorAmount;
      await vendor.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully!',
        data: {
          order: {
            _id: order._id,
            orderId: order.orderId,
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