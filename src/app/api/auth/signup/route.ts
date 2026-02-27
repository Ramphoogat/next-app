import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendOTP } from '@/lib/emailService';

import { generateOTP, hashOTP } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, username, email, password } = await req.json();

    const sanitizedEmail = email?.toLowerCase().trim();
    const sanitizedUsername = username?.trim();

    if (!sanitizedEmail || !sanitizedUsername || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({
      $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        const field = existingUser.email === sanitizedEmail ? "Email" : "Username";
        return NextResponse.json({ message: `${field} already in use` }, { status: 400 });
      }
      // If not verified, cleanup
      await User.deleteOne({ _id: existingUser._id });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";
    const isHiddenAdmin = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      role,
      isHiddenAdmin,
      otp: hashOTP(otp),
      otpExpires,
      isVerified: false
    });

    await newUser.save();

    try {
      await sendOTP(sanitizedEmail, otp);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return NextResponse.json({
      message: "Signup successful! Please verify your account with the OTP sent."
    }, { status: 201 });

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
