import { NextFunction, Request, Response } from "express";
import { ReviewService } from "./review.service";

export const ReviewController = {
  async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewService.getAllReviews({
        query: req.validatedQuery,
      });

      res.json({ status: "success", ...reviews });
    } catch (error) {
      next(error);
    }
  },

  async getReviewsOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user.id;
      // const { reviewId, balasan_pemilik } = req.body;
      const review = await ReviewService.getKostReviewsOwner(
        ownerId,
        req.query
      );
      res.json({ message: "Berhasil mendapatkan data review", data: review });
    } catch (error) {
      next(error);
    }
  },
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.id;
      const { bookingId } = req.params;

      await ReviewService.createReview(bookingId, tenantId, req.body);

      res.json({ status: "success", message: "Ulasan berhasil dikirim." });
    } catch (error) {
      next(error);
    }
  },

  async replyReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const review = await ReviewService.replyReview(reviewId, req.body);
      res.json({ message: "Balasan ulasan berhasil ditambahkan", review });
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      const review = await ReviewService.deleteReview(reviewId);
      res.json({ message: "Balasan ulasan berhasil ditambahkan", review });
    } catch (error) {
      next(error);
    }
  },
};
