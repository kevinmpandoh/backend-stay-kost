import { BaseRepository } from "../../core/base.repository";
import { IPayout, Payout } from "./payout.model";

export class PayoutRepository extends BaseRepository<IPayout> {
  constructor() {
    super(Payout);
  }
}

export const payoutRepository = new PayoutRepository();
