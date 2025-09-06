import { ResponseError } from "@/utils/response-error.utils";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export function validate(
  schema: Joi.ObjectSchema,
  where: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate((req as any)[where], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errors: Record<string, string> = {};
      error.details.forEach((detail) => {
        const key = detail.path.join("."); // Mendapatkan nama field
        errors[key] = detail.message.replace(/['"]/g, ""); // Menghapus tanda kutip di error message
      });
      throw new ResponseError(400, "Validasi gagal", errors);
    }

    if (where === "query") {
      (req as any).validatedQuery = value;
    } else if (where === "params") {
      (req as any).validatedParams = value;
    } else {
      (req as any)[where] = value;
      // (req as any).validatedBody = value;
    }

    next();
  };
}

// import { Request, Response, NextFunction } from "express";
// import { ObjectSchema } from "joi";

// export const validate =
//   (schema: ObjectSchema) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     const { error } = schema.validate(
//       { body: req.body, params: req.params, query: req.query },
//       { abortEarly: false }
//     );
//     if (error)
//       return res
//         .status(400)
//         .json({ message: "Validation failed", details: error.details });
//     next();
//   };
