import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const safePath = req.originalUrl.replace(/%0A|%0D/gi, "").trim();
  console.error("❌", req.method, req.originalUrl);
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      error: "Database error occurred.",
      code: error.code,
      meta: error.meta,
      path: safePath,
    });
  }

  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : 500;
  const message =
    error?.message === "string" ? error.message : "Internal Server Error";

  return res.status(statusCode).json({
    error: message,
    status: statusCode,
    path: req.originalUrl,
  });
}
