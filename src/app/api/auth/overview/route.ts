import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth-helpers';

interface PartialUser {
  _id: string;
  role: string;
  createdBy?: string;
  email?: string;
  username?: string;
  name?: string;
  createdAt?: string;
  isVerified?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const users = await User.find(
      {},
      "email username name role isVerified createdAt createdBy"
    ).sort({ createdAt: -1 }).lean();

    const sample = users.slice(0, 2).map((u: PartialUser) => ({
      _id: u._id,
      name: u.name || u.username,
      username: u.username,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      createdBy: u.createdBy
    }));

    // Mocking some stats as in original
    return NextResponse.json({
      totalUsers: users.length,
      activeUsers: Math.floor(users.length * 0.1) + 1,
      securityAlerts: 0,
      systemUptime: "99.9%",
      users: sample,
    });
  } catch (error) {
    console.error("Overview Error:", error);
    return NextResponse.json({ message: "Failed to fetch overview" }, { status: 500 });
  }
}
