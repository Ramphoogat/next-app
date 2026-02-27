import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const user = await User.findById(auth.userId).select("-password -otp -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, email, currentPassword, newPassword } = body;

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (name) user.name = name.trim();

    if (username && username !== user.username) {
      const existing = await User.findOne({ username, _id: { $ne: auth.userId } });
      if (existing) return NextResponse.json({ message: "Username already in use" }, { status: 400 });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: auth.userId } });
      if (existing) return NextResponse.json({ message: "Email already in use" }, { status: 400 });
      user.email = email;
      user.isVerified = false;
    }

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ message: "Current password required" }, { status: 400 });
      const matches = await bcrypt.compare(currentPassword, user.password);
      if (!matches) return NextResponse.json({ message: "Current password incorrect" }, { status: 400 });
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    const safeUser = await User.findById(auth.userId).select("-password -otp -resetPasswordToken -resetPasswordExpires");
    return NextResponse.json({ message: "Profile updated successfully", user: safeUser });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
