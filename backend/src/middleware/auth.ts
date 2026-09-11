import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../config/db";

export interface AuthRequest extends Request {
  user?: any;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  customerType: {
    select: { id: true, code: true, name: true, isActive: true },
  },
} as const;

const getUserFromToken = async (token: string) => {
  const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: userSelect,
  });
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return next();

  try {
    const user = await getUserFromToken(token);
    if (user) req.user = user;
  } catch {
    // Public catalog requests remain available when a stale token is present.
  }

  next();
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
