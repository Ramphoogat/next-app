import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { mode } = await req.json();
    const validModes = ["MODE_1", "MODE_2", "MODE_3"];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = new SystemSettings();
    }
    settings.governanceMode = mode;
    await settings.save();

    return NextResponse.json({ message: `Governance mode updated to ${mode}`, settings });
  } catch (error) {
    console.error("Mode Update Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
