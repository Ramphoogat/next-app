import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, hashOTP } from '@/lib/auth-utils';
import { sendOTP } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const otp = generateOTP();
    user.otp = hashOTP(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    await user.save();
    await sendOTP(user.email, otp);

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
