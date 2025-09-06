import { BaseRepository } from "../../core/base.repository";
import { IReview, Review } from "./review.model";

export class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(Review);
  }
}

export const reviewRepository = new ReviewRepository();
