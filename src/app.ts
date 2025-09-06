import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import cookieParser from "cookie-parser";
import passport from "@/config/passport";
import errorMiddleware from "@/middlewares/error.middleware";

import { env } from "./config/env";
// import "express-async-errors";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL || "*", credentials: true }));
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api", routes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use(errorMiddleware);

// Route jika tidak ada route yang terdaftar
app.use((_req, res) => {
  res.status(404).json({
    status: "Failed",
    message: "Resource not found",
  });
});

export default app;
