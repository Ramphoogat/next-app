import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashOTP } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'No user profile found for this email' }, { status: 404 });
    }

    const hashedIncomingOtp = hashOTP(otp);

    if (!user.otp || user.otp !== hashedIncomingOtp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpGraceExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { 
        email: user.email, 
        userId: user._id.toString(), 
        userRole: user.role, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ message: "Authentication successful", result: user, token });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
