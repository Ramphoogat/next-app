import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const logs = await ActivityLog.find()
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .limit(100);
      
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ message: 'Error fetching logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);
    const { action, module, description } = await req.json();
    
    const log = new ActivityLog({
      user: auth ? auth.userId : undefined,
      action,
      module,
      description
    });
    
    await log.save();
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json({ message: 'Error creating log' }, { status: 500 });
  }
}
