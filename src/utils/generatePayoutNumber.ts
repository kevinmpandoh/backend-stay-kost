/**
 * Generates a unique payout number in the format: "PO-YYYYMMDD-XXXX"
 * where XXXX is a random 4-digit number.
 */
export function generatePayoutNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `PO-${datePart}-${randomPart}`;
}
