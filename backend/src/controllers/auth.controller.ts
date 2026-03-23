import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";

export async function registerHandler(req: Request, res: Response) {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are Required" });
  }

  const result = await registerUser(email, password, name);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are Required" });
  }

  const result = await loginUser(email, password);
  res.status(200).json(result);
}
