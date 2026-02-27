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

    const { enabled } = await req.json();
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ message: "Invalid value" }, { status: 400 });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = new SystemSettings();
    }
    settings.roleSystemEnabled = enabled;
    await settings.save();

    return NextResponse.json({ message: `Role system ${enabled ? 'enabled' : 'disabled'}`, settings });
  } catch (error) {
    console.error("Toggle Settings Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
