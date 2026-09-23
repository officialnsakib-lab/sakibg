// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const decoded = await getUserFromCookie();
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    let settings = await (Settings as any).findOne();
    
    if (!settings) {
      settings = await (Settings as any).create({
        siteName: 'Wahisnova',
        siteDescription: 'Digital Marketplace',
        supportEmail: 'support@wahisnova.com',
        defaultCommission: 10,
        allowRegistration: true,
        maintenanceMode: false
      });
    }
    
    return NextResponse.json(
      { success: true, data: { settings } },
      { status: 200 }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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
    
    let settings = await (Settings as any).findOne();
    
    if (!settings) {
      settings = await (Settings as any).create(body);
    } else {
      Object.assign(settings, body);
      settings.updatedAt = new Date();
      await settings.save();
    }
    
    return NextResponse.json(
      { success: true, message: 'Settings saved', data: { settings } },
      { status: 200 }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}