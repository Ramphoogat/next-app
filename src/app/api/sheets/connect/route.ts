import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemSettings from '@/models/SystemSettings';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { sheetId } = await req.json();
    if (!sheetId) return NextResponse.json({ message: 'Sheet ID required' }, { status: 400 });

    let extractedId = sheetId;
    const match = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) extractedId = match[1];

    // Verify access
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const googleAuth = new google.auth.JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: googleAuth });
    await sheets.spreadsheets.get({ spreadsheetId: extractedId });

    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings();
    settings.googleSheetId = extractedId;
    await settings.save();

    return NextResponse.json({ message: "Sheet connected successfully", sheetId: extractedId });
  } catch (error: unknown) {
    console.error("Connect Sheet Error:", error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "Server Error" }, { status: 500 });
  }
}
