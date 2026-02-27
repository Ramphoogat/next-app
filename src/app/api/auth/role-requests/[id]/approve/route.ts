import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RoleRequest from '@/models/RoleRequest';
import { verifyAuth, isEditor } from '@/lib/auth-helpers';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isEditor(auth)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const request = await RoleRequest.findById(id);
    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ message: "Request already processed" }, { status: 400 });
    }

    const user = await User.findById(request.userId);
    if (user) {
      user.role = request.requestedRole as 'user' | 'author' | 'editor' | 'admin';
      await user.save();
    }

    request.status = "approved";
    await request.save();

    return NextResponse.json({ message: "Request approved and user role updated" });
  } catch (error) {
    console.error("Approve Request Error:", error);
    return NextResponse.json({ message: "Failed to approve request" }, { status: 500 });
  }
}
