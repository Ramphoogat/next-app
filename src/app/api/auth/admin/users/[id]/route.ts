import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import RoleRequest from '@/models/RoleRequest';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';
import { performSheetSync } from '@/lib/sheets';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    // Prevent deleting self
    if (id === auth.userId) {
      return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Check for hidden admin
    const oldestAdmin = await User.findOne({ role: "admin" }, "_id", { sort: { createdAt: 1 } });
    const isTargetHidden = userToDelete.isHiddenAdmin || (oldestAdmin && String(userToDelete._id) === String(oldestAdmin._id));

    if (isTargetHidden) {
      const requester = await User.findById(auth.userId);
      const isRequesterHidden = requester?.isHiddenAdmin || (oldestAdmin && String(requester?._id) === String(oldestAdmin._id));
      if (!isRequesterHidden) {
        return NextResponse.json({ message: "You do not have permission to delete this protected admin user." }, { status: 403 });
      }
    }

    await User.findByIdAndDelete(id);
    await RoleRequest.deleteMany({ userId: id });
    
    try { 
      await performSheetSync(); 
    } catch (e) { 
      console.error("Sync failed after delete", e); 
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
