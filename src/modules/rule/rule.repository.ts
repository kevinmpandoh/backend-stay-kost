import { BaseRepository } from "../../core/base.repository";
import { IRule, Rule } from "./rule.model";

export class RuleRepository extends BaseRepository<IRule> {
  constructor() {
    super(Rule);
  }
}

export const ruleRepository = new RuleRepository();
