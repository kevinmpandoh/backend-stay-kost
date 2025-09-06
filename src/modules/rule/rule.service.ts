import { ResponseError } from "@/utils/response-error.utils";
import { ruleRepository } from "./rule.repository";

export const RuleService = {
  async getRules() {
    return await ruleRepository.findAll();
  },

  async createRule(payload: { name: string }) {
    return await ruleRepository.create(payload);
  },

  async updateRule(ruleId: string, payload: any) {
    const newRule = await ruleRepository.updateById(ruleId, payload);
    if (!newRule) throw new ResponseError(404, "Rule not found");
    return newRule;
  },
  async deleteRule(ruleId: string) {
    return await ruleRepository.deleteById(ruleId);
  },
};
