import { verifyAccess } from "@/utils/jwt.utils";
import { User } from "@/modules/user/user.model";
import { ResponseError } from "@/utils/response-error.utils";
import { Request, Response, NextFunction } from "express";

export async function auth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = (req as any).cookies?.accessToken as string | undefined;
    const bearer = header?.startsWith("Bearer ")
      ? header.split(" ")[1]
      : undefined;
    const token = cookieToken || bearer;
    if (!token) throw new ResponseError(401, "Unauthorized");
    const payload = verifyAccess(token);
    const exists = await User.findById(payload.id);
    if (!exists) throw new ResponseError(401, "User not found");
    req.user = { id: exists._id.toString(), role: exists.role };
    next();
  } catch (e: any) {
    if (e.name === "TokenExpiredError")
      return next(new ResponseError(401, "Access token expired"));
    next(e);
  }
}

export function role(roles: Array<"admin" | "owner" | "tenant">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
