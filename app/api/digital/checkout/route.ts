import { NextResponse } from 'next/server';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(req: Request) {
  try {
    const { buyerId, productId, paymentMethod, paymentId, senderNumber } = await req.json();

    const product = await Product.findById(productId);
    if (!product || product.productType !== 'digital') {
      return NextResponse.json({ error: 'invalid_digital_product' }, { status: 400 });
    }

    const commissionRate = 10; // ১০% কমিশন
    const commissionAmount = (product.price * commissionRate) / 100;
    const vendorAmount = product.price - commissionAmount;

    const newOrder = await Order.create({
      buyerId,
      vendorId: product.vendorId,
      productType: 'digital',
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      price: product.price,
      commissionRate,
      commissionAmount,
      vendorAmount,
      paymentStatus: 'pending',
      paymentMethod,
      paymentId,
      senderNumber,
      orderStatus: 'pending' // এডমিন পেমেন্ট ভেরিফাই করে এপ্রুভ করবে
    });

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder.orderId, 
      message: 'পেমেন্ট জমা দেওয়া হয়েছে। এডমিন ভেরিফিকেশনের জন্য পেন্ডিং আছে।' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}