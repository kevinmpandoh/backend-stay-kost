export class ResponseError extends Error {
  statusCode: number;
  errors: { [key: string]: string };

  constructor(
    statusCode: number,
    message: string,
    errors?: { [key: string]: string }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors || {};
  }
}
