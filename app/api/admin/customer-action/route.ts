import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { customerId, action } = body;
    
    const customer = await (User as any).findById(customerId);
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    if (action === 'ban') {
      customer.isBanned = true;
      customer.isActive = false;
      await customer.save();
      
      return NextResponse.json(
        { success: true, message: 'Customer banned' },
        { status: 200 }
      );
    } else if (action === 'unban') {
      customer.isBanned = false;
      customer.isActive = true;
      await customer.save();
      
      return NextResponse.json(
        { success: true, message: 'Customer unbanned' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Customer action error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}