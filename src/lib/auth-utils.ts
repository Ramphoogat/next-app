import crypto from 'crypto';

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOTP = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const generateToken = () => crypto.randomBytes(32).toString("hex");

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
