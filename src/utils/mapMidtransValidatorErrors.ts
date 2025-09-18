import { ResponseError } from "./response-error.utils";

export function mapMidtransValidationError(apiRes: any): ResponseError {
  const errors = apiRes.errors || {};
  const msg = apiRes.error_message || "Bank account validation failed";

  // Mapping error account
  if (errors?.account?.includes("Account does not exist")) {
    return new ResponseError(400, "Nomor rekening tidak ditemukan", errors);
  }
  if (errors?.account?.includes("Account is dormant")) {
    return new ResponseError(
      400,
      "Nomor rekening dormant / tidak aktif",
      errors
    );
  }
  if (errors?.account?.includes("Account is closed")) {
    return new ResponseError(400, "Nomor rekening sudah ditutup", errors);
  }
  if (
    errors?.account?.includes("You are not authorized to perform this action")
  ) {
    return new ResponseError(
      401,
      "Tidak diizinkan melakukan validasi rekening",
      errors
    );
  }
  if (
    errors?.account?.includes(
      "Bank account validation is currently unavailable"
    )
  ) {
    return new ResponseError(
      503,
      "Validasi rekening sementara tidak tersedia",
      errors
    );
  }

  // Mapping error bank
  if (errors?.bank?.includes("is not included in the list")) {
    return new ResponseError(400, "Bank tidak tersedia / tidak valid", errors);
  }

  // fallback
  return new ResponseError(400, msg, errors);
}
