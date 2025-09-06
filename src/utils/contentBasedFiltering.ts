import { TfIdf, Tokenizer } from "natural";

export const getTfIdfVectors = (docs: string[][]): TfIdf => {
  const tfidf = new TfIdf();

  // Tambahkan langsung array token (bukan string) sebagai dokumen
  docs.forEach((docTokens) => tfidf.addDocument(docTokens));
  return tfidf;
};

export const getCosineSimilarity = (tfidf: TfIdf, docIndex: number): number => {
  const allTermsSet = new Set<string>();

  // Ambil semua term dari seluruh dokumen
  for (let i = 0; i < tfidf.documents.length; i++) {
    tfidf.listTerms(i).forEach((t) => allTermsSet.add(t.term));
  }

  const allTerms = Array.from(allTermsSet);

  const userVector = allTerms.map((term) => tfidf.tfidf(term, 0));
  const kostVector = allTerms.map((term) => tfidf.tfidf(term, docIndex));

  const dot = userVector.reduce((acc, val, i) => acc + val * kostVector[i], 0);
  const mag1 = Math.sqrt(userVector.reduce((acc, val) => acc + val ** 2, 0));
  const mag2 = Math.sqrt(kostVector.reduce((acc, val) => acc + val ** 2, 0));

  return mag1 && mag2 ? dot / (mag1 * mag2) : 0;
};

export const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getHaversineScore = (distance: number): number => {
  if (distance <= 600) return 1;
  if (distance <= 1200) return 0.8;
  if (distance <= 1800) return 0.6;
  if (distance <= 2400) return 0.4;
  if (distance <= 3000) return 0.2;
  return 0;
};

export const getPriceScore = (
  harga: number,
  min: number,
  max: number
): number => {
  if (harga <= min) return 1;
  if (harga >= max) return 0;
  return 1 - (harga - min) / (max - min);
};
