// // middlewares/subscription.middleware.ts
// import { Subscription } from "@/modules/subscription/subscription.model";
// import { NextFunction, Request, Response } from "express";

// export const checkSubscription = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const ownerId = req.user.id;

//   // kalau endDate = null → dianggap unlimited
//   req.body.subscription = subscription;
//   next();
// };
