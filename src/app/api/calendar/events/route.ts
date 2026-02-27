import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CalendarData from '@/models/CalendarData';
import { verifyAuth } from '@/lib/auth-helpers';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Clear both events and ranges
    await CalendarData.findOneAndUpdate(
      { userId: auth.userId },
      { $set: { events: [], ranges: [] } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Workspace cleared", events: [], ranges: [] });
  } catch (error) {
    console.error("Clear Workspace Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
