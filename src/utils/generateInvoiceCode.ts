export const generateInvoiceCode = (): string => {
  const now = new Date();

  // Format tanggal & waktu: YYYYMMDD-HHMMSS
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  // const timePart =
  //   String(now.getHours()).padStart(2, "0") +
  //   String(now.getMinutes()).padStart(2, "0") +
  //   String(now.getSeconds()).padStart(2, "0");

  // Generate 4 karakter acak (huruf + angka)
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `INV-${datePart}-${randomPart}`;
};
