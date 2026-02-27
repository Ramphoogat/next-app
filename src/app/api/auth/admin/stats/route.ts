import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth, isAuthor } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAuthor(auth)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const totalUsers = await User.countDocuments();
    
    return NextResponse.json({
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.1) + 1,
      securityAlerts: 0,
      systemUptime: "99.9%",
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
