import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import SystemSettings from '@/models/SystemSettings';
import { verifyAuth, isEditor } from '@/lib/auth-helpers';
import { canManageRole, Role } from '@/lib/role-delegation';
import { performSheetSync } from '@/lib/sheets';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isEditor(auth)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { role: newRole } = await req.json();

    const validRoles = ["user", "author", "editor", "admin"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const requester = await User.findById(auth.userId);
    if (!requester) {
       return NextResponse.json({ message: "Requester not found" }, { status: 403 });
    }

    const oldestAdmin = await User.findOne({ role: "admin" }, "_id", { sort: { createdAt: 1 } });
    
    // Check hidden admin status
    const isRequesterHiddenAdmin = requester.isHiddenAdmin || (requester.role === "admin" && oldestAdmin && String(requester._id) === String(oldestAdmin._id));
    const isTargetHiddenAdmin = userDoc.isHiddenAdmin || (userDoc.role === "admin" && oldestAdmin && String(userDoc._id) === String(oldestAdmin._id));

    if (isTargetHiddenAdmin) {
      const isSelf = String(auth.userId) === String(userId);
      if (!isSelf && !isRequesterHiddenAdmin) {
        return NextResponse.json({ message: "Access denied. You cannot modify this admin account." }, { status: 403 });
      }
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ roleSystemEnabled: true, governanceMode: "MODE_1" });
    }

    if (!settings.roleSystemEnabled) {
      return NextResponse.json({ message: "Role system disabled by admin settings" }, { status: 403 });
    }

    const oldRole = userDoc.role;

    const allowedByMatrix = await canManageRole(auth.userRole as Role, newRole as Role);
    const hiddenAdminAssigningAnyRole = isRequesterHiddenAdmin && !isTargetHiddenAdmin;
    
    if (!allowedByMatrix && !hiddenAdminAssigningAnyRole) {
      return NextResponse.json({ message: "You are not allowed to assign this role" }, { status: 403 });
    }

    const canManageExisting = await canManageRole(auth.userRole as Role, oldRole as Role);
    const hiddenAdminModifyingNonHidden = isRequesterHiddenAdmin && !isTargetHiddenAdmin;
    
    if (!canManageExisting && !hiddenAdminModifyingNonHidden) {
      return NextResponse.json({ message: "You are not allowed to modify this user" }, { status: 403 });
    }

    if (oldRole === "admin" && auth.userRole !== "admin" && !isRequesterHiddenAdmin) {
       return NextResponse.json({ message: "Access denied. You cannot modify an Admin account." }, { status: 403 });
    }

    if (oldRole !== newRole) {
      userDoc.role = newRole;
      await userDoc.save();
      try { await performSheetSync(); } catch (e) { console.error("Sync failed", e); }
    }

    return NextResponse.json({ message: "Role updated successfully", user: userDoc });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return NextResponse.json({ message: "Failed to update role" }, { status: 500 });
  }
}
