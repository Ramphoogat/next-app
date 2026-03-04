import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const signJWT = (payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string | number = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOTP = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const generateToken = () => crypto.randomBytes(32).toString("hex");

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
