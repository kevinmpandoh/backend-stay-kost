export function formatAliasName(name: string): string {
  // hapus karakter non-alphanumeric dan spasi
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
  // tambahkan 3 digit random (bisa diubah jadi 4 kalau mau)
  const random = Math.floor(100 + Math.random() * 900);
  const alias = `${cleanName}${random}`;
  // batasi maksimal 20 karakter
  return alias.substring(0, 20);
}
