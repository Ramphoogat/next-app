import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RoleRequest from '@/models/RoleRequest';
import { verifyAuth, isEditor } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isEditor(auth)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const requests = await RoleRequest.find()
      .populate("userId", "name username email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get Role Requests Error:", error);
    return NextResponse.json({ message: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { requestedRole, description } = await req.json();
    const validRoles = ["admin", "editor", "author", "user"];

    if (!validRoles.includes(requestedRole)) {
      return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
    }

    const existingRequest = await RoleRequest.findOne({ 
      userId: auth.userId, 
      status: "pending" 
    });

    if (existingRequest) {
      return NextResponse.json({ message: "You already have a pending request" }, { status: 400 });
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newRequest = new RoleRequest({
      userId: auth.userId,
      currentRole: user.role,
      requestedRole,
      description,
    });

    await newRequest.save();

    return NextResponse.json({ message: "Role request submitted successfully", request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Create Role Request Error:", error);
    return NextResponse.json({ message: "Failed to submit request" }, { status: 500 });
  }
}
