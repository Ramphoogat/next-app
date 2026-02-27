import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  userRole: string;
  email?: string;
  username?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { 
      userId?: string; 
      id?: string; 
      _id?: string; 
      userRole?: string;
      role?: string; 
      email?: string; 
      username?: string 
    };

    const userId = decoded.userId || decoded.id || decoded._id;
    const userRole = decoded.userRole || decoded.role || 'user';

    if (!userId) {
      return null;
    }

    return {
      userId: String(userId),
      userRole,
      email: decoded.email,
      username: decoded.username
    };
  } catch {
    return null;
  }
}

export function isAdmin(user: AuthUser) {
  return user.userRole === 'admin';
}

export function isAuthor(user: AuthUser) {
  return ['admin', 'author'].includes(user.userRole);
}

export function isEditor(user: AuthUser) {
  return ['admin', 'author', 'editor'].includes(user.userRole);
}
