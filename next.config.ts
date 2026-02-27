import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

try {
  const duplicatePath = path.join(process.cwd(), "src/app/api/auth/admin/users/[userId]");
  if (fs.existsSync(duplicatePath)) {
    fs.rmSync(duplicatePath, { recursive: true, force: true });
    console.log("Cleaned up conflicting API route: [userId]");
  }
} catch {
  // Ignore
}
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
