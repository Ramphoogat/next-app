import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

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
    return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=GitHub login failed: No code provided`), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  try {
    await connectDB();

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const tokenData = await tokenResponse.json();

    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const emailData = await emailResponse.json();
    const primaryEmail = emailData.find((email: { email: string; primary: boolean }) => email.primary)?.email || emailData[0]?.email;

    if (!primaryEmail) {
      return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=GitHub login failed: No primary email found`), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      user = new User({
        name: userData.name || userData.login,
        email: primaryEmail,
        username: userData.login || primaryEmail.split("@")[0] + Math.random().toString(36).substring(7),
        githubId: userData.id.toString(),
        isVerified: true,
        role: "user",
        password: "social-login-" + Math.random().toString(36),
      });
      await user.save();
    } else {
      if (!user.githubId) {
        user.githubId = userData.id.toString();
        await user.save();
      }
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
    console.error("GitHub Auth Error:", error);
    return new NextResponse(getLoaderPage(`${CLIENT_URL}/login?error=GitHub login failed`), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
