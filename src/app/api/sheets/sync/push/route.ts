import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import User from '@/models/User';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';
import { performSheetSync } from '@/lib/sheets';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const settings = await SystemSettings.findOne();
    if (!settings || !settings.googleSheetId) {
      return NextResponse.json({ message: "No Google Sheet connected" }, { status: 400 });
    }

    await performSheetSync();

    const count = await User.countDocuments();
    return NextResponse.json({ message: `Synced ${count} users to Google Sheet` });
  } catch (error: unknown) {
    console.error("Sync Push Error:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Server Error" }, { status: 500 });
  }
}
