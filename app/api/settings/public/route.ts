// app/api/settings/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    let settings = await (Settings as any).findOne();
    
    if (!settings) {
      settings = {
        siteName: 'Wahisnova',
        siteDescription: 'Digital Marketplace',
        supportEmail: 'support@wahisnova.com',
        defaultCommission: 10,
        allowRegistration: true,
        maintenanceMode: false
      };
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