import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOTP } from '@/lib/emailService';
import crypto from 'crypto';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    let identifier = body.identifier;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ message: "Identifier and password are required" }, { status: 400 });
    }

    identifier = identifier.trim();
    if (identifier.includes("@")) identifier = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    // Grace period check
    if (user.otpGraceExpires && user.otpGraceExpires > new Date()) {
      const token = jwt.sign(
        { email: user.email, id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "5mins" }
      );

      return NextResponse.json({
        message: "Login successful",
        result: user,
        token
      });
    }

    // 2FA Flow
    const otp = generateOTP();
    user.otp = hashOTP(otp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTP(user.email, otp);
    } catch (e) {
      console.error("OTP send failed:", e);
    }

    return NextResponse.json({
      message: "Credentials valid. OTP sent to your email.",
      email: user.email,
      currentRole: user.role
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
