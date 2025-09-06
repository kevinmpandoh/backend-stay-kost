import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { ResponseError } from "../utils/response-error.utils";

export default function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!error) {
    next();
  }

  if (error instanceof ResponseError) {
    logger.error(error);
    const responsePayload: any = {
      message: error.message,
    };

    if (Object.keys(error.errors).length > 0) {
      responsePayload.errors = error.errors;
    }

    res.status(error.statusCode).json(responsePayload).end();
  } else {
    logger.error(error.message);
    //  console.log(error);
    res
      .status(error.status || 500)
      .json({
        message: error.message || "Internal server error",
      })
      .end();
  }
}
