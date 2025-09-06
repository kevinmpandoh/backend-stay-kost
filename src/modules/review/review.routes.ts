import express from "express";
import { ReviewController } from "./review.controller";
import { auth, role } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createReplyReviewSchema } from "./review.validation";

const router = express.Router();

router.use(auth);

router.get("/", ReviewController.getAllReviews);
router.get("/owner", role(["owner"]), ReviewController.getReviewsOwner);
router.post("/review", ReviewController.createReview);
router.patch(
  "/:reviewId/reply",
  validate(createReplyReviewSchema),
  ReviewController.replyReview
);
router.delete("/:reviewId", ReviewController.deleteReview);

export default router;
