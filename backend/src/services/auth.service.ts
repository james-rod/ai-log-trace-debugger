import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as unknown as jwt.SignOptions["expiresIn"];

function signToken(userId: string) {
  if (!JWT_SECRET) {
    const err: any = new Error("JWT_SECRET is not set");
    err.statusCode = 500;
    throw err;
  }

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const err: any = new Error("User with this email already exists");
    err.statusCode = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true },
  });

  const token = signToken(user.id);
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}
