import { auth, role } from "@/middlewares/auth.middleware";
import express from "express";
import { RuleController } from "./rule.controller";
import { validate } from "@/middlewares/validate.middleware";
import { RuleValidation } from "./rule.validation";

const router = express.Router();

// router.use(auth);

router.get("/", RuleController.getRules);
router.post(
  "/",
  validate(RuleValidation.createRuleSchema),
  RuleController.createRule
);
router.put(
  "/:ruleId",
  validate(RuleValidation.updateRuleSchema),
  RuleController.updateRule
);
router.delete("/:ruleId", RuleController.deleteRule);

export default router;
