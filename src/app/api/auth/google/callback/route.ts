import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const googleClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SERVER_URL || "http://localhost:3000"}/api/auth/google/callback`
);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const getLoaderPage = (redirectUrl: string, message: string = "Authenticating...") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${message}</title>
      <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #111827; color: #d1d5db; font-family: sans-serif; }
        .container { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .loader { width: 48px; height: 48px; border: 4px solid #10b981; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .text { font-size: 0.875rem; font-weight: 600; opacity: 0.8; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="loader"></div>
        <div class="text">${message}</div>
      </div>
      <script>window.location.href = "${redirectUrl}";</script>
    </body>
    </html>
  `;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=Google login failed: No code provided`), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    await connectDB();
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: googleClient, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=Google login failed: No email provided`), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    let user = await User.findOne({ email: data.email });

    if (!user) {
      user = new User({
        name: data.name,
        email: data.email,
        username: data.email.split("@")[0] + Math.random().toString(36).substring(7),
        googleId: data.id,
        isVerified: true,
        role: "user",
        password: "social-login-" + Math.random().toString(36),
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = data.id as string;
      if (tokens.access_token) user.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
      await user.save();
    }

    const token = jwt.sign(
      { 
        email: user.email, 
        userId: user._id.toString(), 
        userRole: user.role, 
        username: user.username 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?token=${token}&role=${user.role}`, "Login Successful! Redirecting..."), {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=Google login failed`), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
