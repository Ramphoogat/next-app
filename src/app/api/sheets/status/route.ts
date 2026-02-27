import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const settings = await SystemSettings.findOne();
    return NextResponse.json({ 
      connected: !!settings?.googleSheetId, 
      sheetId: settings?.googleSheetId,
      lastSync: settings?.lastSync 
    });
  } catch (error) {
    console.error("Sheet Status Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
