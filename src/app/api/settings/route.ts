import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import { verifyAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        roleSystemEnabled: true,
        governanceMode: "MODE_1",
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get Settings Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
