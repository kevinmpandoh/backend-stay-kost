declare namespace Express {
  export interface Request {
    user: { id: string; role: "admin" | "owner" | "tenant" };
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
  }
}
