import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const TOKEN_EXPIRY = (process.env.JWT_EXPIRY || "7d") as SignOptions["expiresIn"];

export interface AuthPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as AuthPayload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "ไม่พบ token" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }

  req.user = user;
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "ไม่พบ token" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "เฉพาะแอดมิน" });
  }

  next();
}

export function asyncHandler(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}