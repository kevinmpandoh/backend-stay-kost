interface ValidationResult {
  valid: boolean;
  warning?: string;
  error?: string;
}

/**
 * Validasi nama rekening vs nama akun pengguna.
 * Mengizinkan perbedaan kecil seperti huruf besar/kecil, spasi, atau nama tengah.
 */
export function validateAccountName(
  accountName: string,
  ownerName: string
): ValidationResult {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z]/g, " ") // hilangkan non-huruf
      .split(" ")
      .filter(Boolean); // pecah jadi kata-kata

  const accWords = normalize(accountName);
  const ownerWords = normalize(ownerName);

  // hitung kata yang cocok
  const matches = accWords.filter((w) => ownerWords.includes(w));
  const similarity =
    matches.length / Math.max(accWords.length, ownerWords.length);

  // --- aturan logika ---
  if (similarity === 1) {
    return { valid: true }; // nama identik
  }

  if (similarity >= 0.5) {
    // setengah nama cocok → beri peringatan saja
    return {
      valid: true,
      warning: `Nama rekening (${accountName}) tidak sama persis dengan nama akun (${ownerName}). Pastikan rekening ini milik Anda.`,
    };
  }

  // beda jauh → tolak
  return {
    valid: false,
    error: `Nama rekening (${accountName}) tidak sesuai dengan nama akun (${ownerName}).`,
  };
}
