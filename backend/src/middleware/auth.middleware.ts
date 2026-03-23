import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types/auth";
//import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: payload.userId };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
  // const demoId = "demo-user-id";
  // // attach mock user
  // req.user = { id: demoId };
  // // ensure user exists (dev-only) Auto-create demo user in middleware
  // await prisma.user.upsert({
  //   where: { id: demoId },
  //   update: {},
  //   create: {
  //     id: demoId,
  //     email: "demo@example.com",
  //     password: "demo",
  //     name: "Demo User",
  //   },
  // });
  // next();
}
