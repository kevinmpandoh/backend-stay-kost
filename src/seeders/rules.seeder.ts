import { Rule } from "../modules/rule/rule.model";
import rulesData from "./data/rulesData";

export const seedRules = async () => {
  await Rule.deleteMany(); // Hapus semua data sebelumnya

  const rules = await Rule.insertMany(rulesData);

  console.log(
    "✅ Peraturan Seeded:",
    rules.length,
    "peraturan berhasil ditambahkan."
  );
  return rules;
};
