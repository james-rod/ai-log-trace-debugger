console.log("=== server.ts starting ===");
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ENV } from "./config/env";
import traceRoutes from "./routes/trace.routes";
import timelineRoutes from "./routes/timeline.routes";
import { requestLogger } from "./middleware/logger.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean,
) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
console.log("✅ CORS middleware mounted");

app.use(express.json());

app.use((req, _res, next) => {
  // normalize odd whitespace/newlines from clients
  console.log("INCOMING:", req.method, req.url);
  // req.url = req.url.replace(/%0A|%0D/gi, "").trim(); // same as decodeURIComponent
  //req.url = decodeURIComponent(req.url).trim();
  // Normalize odd whitespace/newlines from clients (Postman %0A / %0D)
  const decoded = decodeURIComponent(req.url);
  req.url = decoded.replace(/[\r\n]/g, "").trim(); // removes actual CR/LF
  req.url = req.url.replace(/%0A|%0D/gi, ""); // removes encoded CR/LF just in case

  next();
});

// app.use((req, _res, next) => {
//   console.log("🔥 HIT:", req.method, req.url);
//   next();
// });

app.use(requestLogger);
console.log("✅ requestLogger mounted");

/**
 * -----------------------
 * Routes
 * -----------------------
 */

app.get("/", (_req, res) => {
  res.send("ROOT OK");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", from: "server.ts health route" });
});

app.use("/auth", authRoutes);
app.use("/traces", traceRoutes);
app.use("/timelines", timelineRoutes);

app.use("/ai", aiRoutes);

/**
 * -----------------------
 * 404 handler (must be AFTER routes)
 * -----------------------
 */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorMiddleware);

console.log("ENV.PORT =", ENV.PORT);

console.log("=== about to listen on ===", ENV.PORT);
app.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on port ${ENV.PORT}`);
});
setInterval(() => {}, 1000);
