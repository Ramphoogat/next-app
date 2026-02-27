import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email required to set grace period" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (user) {
      // Set 5 minute grace period
      user.otpGraceExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
    }
    
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
