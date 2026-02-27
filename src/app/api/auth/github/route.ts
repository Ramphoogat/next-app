import { NextResponse } from 'next/server';

export async function GET() {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = `${process.env.SERVER_URL || "http://localhost:3000"}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=user:email&prompt=consent`;

  return NextResponse.redirect(url);
}
