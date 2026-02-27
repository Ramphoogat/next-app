import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CalendarData from '@/models/CalendarData';
import { verifyAuth } from '@/lib/auth-helpers';

/**
 * This route no longer fetches data from Google Calendar to prevent 
 * external data (like holidays) from entering the local system.
 * It simply returns the current local state.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let doc = await CalendarData.findOne({ userId: auth.userId });

    if (!doc) {
      doc = await CalendarData.create({ userId: auth.userId, events: [], ranges: [] });
    }

    return NextResponse.json({ events: doc.events, ranges: doc.ranges });

  } catch (error) {
    console.error("Sync Calendar Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
