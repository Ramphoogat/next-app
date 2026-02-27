import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);

    if (!auth || !isAdmin(auth)) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Returning empty logs as in original code
    return NextResponse.json({ logs: [] });
  } catch (error) {
    console.error("Server Logs Error:", error);
    return NextResponse.json({ message: "Failed to fetch logs" }, { status: 500 });
  }
}
