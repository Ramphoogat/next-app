import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CalendarData from '@/models/CalendarData';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth-helpers';
import { google } from 'googleapis';
import { CalendarEvent, DateRange } from '@/types/calendar';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const doc = await CalendarData.findOneAndUpdate(
      { userId: auth.userId },
      { $setOnInsert: { events: [], ranges: [] } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ events: doc.events, ranges: doc.ranges });
  } catch (error) {
    console.error("Get Calendar Data Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { events: incomingEvents = [], ranges: incomingRanges = [] } = await req.json();
    const user = await User.findById(auth.userId);
    const existingDoc = await CalendarData.findOne({ userId: auth.userId });
    
    const existingEvents = existingDoc ? existingDoc.events : [];
    const existingRanges = existingDoc ? existingDoc.ranges : [];

    const updatedEvents = [...incomingEvents];
    const updatedRanges = [...incomingRanges];

    if (user && user.googleAccessToken) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // --- Handle SYNC for EVENTS ---
      const incomingEventIds = new Set(incomingEvents.map((e: CalendarEvent) => e.id));
      const deletedEvents = existingEvents.filter((e: CalendarEvent) => e.googleEventId && !incomingEventIds.has(e.id));
      
      for (const event of deletedEvents) {
        try {
          await calendar.events.delete({ calendarId: 'primary', eventId: event.googleEventId });
        } catch (e) {
          console.error("Failed to delete event from Google:", e);
        }
      }

      for (let i = 0; i < updatedEvents.length; i++) {
        const event = updatedEvents[i];
        if (event.id.startsWith("gcal-")) continue;
        const gEvent = {
          summary: event.title,
          description: event.description || '',
          start: { dateTime: new Date(event.start).toISOString() },
          end: { dateTime: new Date(event.end).toISOString() },
        };
        try {
          if (event.googleEventId) {
            await calendar.events.update({ calendarId: 'primary', eventId: event.googleEventId, requestBody: gEvent });
          } else {
            const created = await calendar.events.insert({ calendarId: 'primary', requestBody: gEvent });
            if (created.data.id) updatedEvents[i] = { ...event, googleEventId: created.data.id };
          }
        } catch (err) {
          console.error("Google Event Sync Error:", err);
        }
      }

      // --- Handle SYNC for RANGES ---
      const incomingRangeIds = new Set(incomingRanges.map((r: DateRange) => r.id));
      const deletedRanges = existingRanges.filter((r: DateRange) => r.googleEventId && !incomingRangeIds.has(r.id));

      for (const range of deletedRanges) {
        try {
          await calendar.events.delete({ calendarId: 'primary', eventId: range.googleEventId });
        } catch (e) {
          console.error("Failed to delete range from Google:", e);
        }
      }

      for (let i = 0; i < updatedRanges.length; i++) {
        const range = updatedRanges[i];
        if (range.id.startsWith("gcal-range-")) continue;

        const gRangeEvent = {
          summary: `[RANGE] ${range.label || 'Untitled Range'}`,
          description: range.description || '',
          start: { dateTime: new Date(range.start).toISOString() },
          end: { dateTime: new Date(range.end).toISOString() },
          colorId: '11', // Distinct color for ranges (bold blue/gray)
        };

        try {
          if (range.googleEventId) {
            await calendar.events.update({ calendarId: 'primary', eventId: range.googleEventId, requestBody: gRangeEvent });
          } else {
            const created = await calendar.events.insert({ calendarId: 'primary', requestBody: gRangeEvent });
            if (created.data.id) updatedRanges[i] = { ...range, googleEventId: created.data.id };
          }
        } catch (err) {
          console.error("Google Range Sync Error:", err);
        }
      }
    }

    const localEventsToSave = updatedEvents.filter((e: CalendarEvent) => !e.id.startsWith("gcal-"));
    const localRangesToSave = updatedRanges.filter((r: DateRange) => !r.id.startsWith("gcal-range-"));

    const doc = await CalendarData.findOneAndUpdate(
      { userId: auth.userId },
      { $set: { events: localEventsToSave, ranges: localRangesToSave } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ events: doc.events, ranges: doc.ranges });
  } catch (error) {
    console.error("Save Calendar Data Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
