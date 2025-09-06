export function formatAliasName(ownerId: string, bank: string): string {
  let alias = `${bank}${ownerId}`; // contoh bni64f02c1234
  alias = alias.replace(/[^a-zA-Z0-9]/g, ""); // hapus karakter non-alphanumeric
  return alias.substring(0, 15); // batasi max 20
}
