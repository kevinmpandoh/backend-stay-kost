interface PayoutErrorMap {
  ownerMessage: string; // pesan yang ditampilkan ke owner
  adminReason: string; // pesan detail untuk admin
  isInternalError: boolean;
}

export function mapPayoutError(
  errorCode: string,
  errorMessage?: string
): PayoutErrorMap {
  switch (errorCode) {
    // 🔹 Error eksternal → tampilkan ke owner
    case "001":
      return {
        ownerMessage: "Nama penerima tidak valid",
        adminReason: errorMessage || "Invalid beneficiary name",
        isInternalError: false,
      };
    case "002":
      return {
        ownerMessage: "Nomor rekening tujuan tidak valid",
        adminReason: errorMessage || "Invalid destination account number",
        isInternalError: false,
      };
    case "003":
      return {
        ownerMessage: "Nama penerima atau rekening tujuan tidak sesuai",
        adminReason:
          errorMessage || "Invalid destination account or beneficiary name",
        isInternalError: false,
      };
    case "012":
      return {
        ownerMessage: "Rekening penerima diblokir",
        adminReason: errorMessage || "Beneficiary account is blocked",
        isInternalError: false,
      };
    case "013":
      return {
        ownerMessage: "Nomor rekening penerima sama dengan pengirim",
        adminReason: errorMessage || "Sender and receiver account are the same",
        isInternalError: false,
      };
    case "014":
      return {
        ownerMessage: "Batas saldo bulanan rekening penerima sudah terlampaui",
        adminReason: errorMessage || "Monthly account balance limit exceeded",
        isInternalError: false,
      };
    case "015":
      return {
        ownerMessage: "Saldo rekening penerima tidak mencukupi",
        adminReason: errorMessage || "Account balance limit exceeded",
        isInternalError: false,
      };

    // 🔹 Error internal → jangan ditampilkan ke owner
    case "004":
    case "005":
    case "006":
    case "007":
    case "008":
    case "009":
    case "010":
    case "011":
    case "016":
      return {
        ownerMessage: "Sedang diproses, mohon tunggu",
        adminReason: errorMessage || "Internal platform error",
        isInternalError: true,
      };

    // 🔹 Default
    default:
      return {
        ownerMessage: "Sedang diproses, mohon tunggu",
        adminReason: errorMessage || "Unknown error",
        isInternalError: true,
      };
  }
}
