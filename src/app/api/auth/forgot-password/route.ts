import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, hashToken } from '@/lib/auth-utils';
import { sendResetLink } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const resetToken = generateToken();
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    await sendResetLink(user.email, resetUrl);

    return NextResponse.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
