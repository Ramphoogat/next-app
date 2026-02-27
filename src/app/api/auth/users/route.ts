import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth-helpers';

interface PartialUser {
  _id: string;
  role: string;
  isHiddenAdmin?: boolean;
  createdBy?: string;
  email?: string;
  username?: string;
  name?: string;
  createdAt?: string;
  isVerified?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    let users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();

    // Logic for hidden admins
    if (auth.userRole === "admin") {
      const requester = await User.findById(auth.userId).select("isHiddenAdmin role createdAt");
      const oldestAdmin = await User.findOne({ role: "admin" }, "_id", { sort: { createdAt: 1 } });
      
      const isRequesterHidden = requester?.isHiddenAdmin || (oldestAdmin && String(requester?._id) === String(oldestAdmin._id));

      if (!isRequesterHidden && oldestAdmin) {
        const hiddenAdminId = String(oldestAdmin._id);
        users = users.filter((u: PartialUser) => {
          if (u.role !== "admin") return true;
          return !(u.isHiddenAdmin || String(u._id) === hiddenAdminId);
        });
      }
    }

    // Collect creators to fetch their roles
    const creatorIdentifiers = [...new Set(users.map((u: PartialUser) => u.createdBy).filter(c => c && c !== "Admin"))];
    
    const roleMap = new Map<string, string>();
    if (creatorIdentifiers.length > 0) {
        const creators = await User.find({
            $or: [
                { email: { $in: creatorIdentifiers } },
                { username: { $in: creatorIdentifiers } }
            ]
        }).select("email username role");

        creators.forEach((c: PartialUser) => {
            if (c.email && c.role) roleMap.set(c.email, c.role);
            if (c.username && c.role) roleMap.set(c.username, c.role);
        });
    }

    const safeUsers = users.map((u: PartialUser) => {
        let creatorDisplay = "Admin";
        
        if (u.createdBy && u.createdBy !== "Admin") {
            creatorDisplay = roleMap.get(u.createdBy) || `${u.createdBy} (Deleted)`;
        } else if (u.createdBy === "Admin") {
            creatorDisplay = "Admin";
        }

        return { ...u, createdBy: creatorDisplay }; 
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Get Users Error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}
