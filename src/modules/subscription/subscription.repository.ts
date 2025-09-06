import { BaseRepository } from "../../core/base.repository";
import { ISubscription, Subscription } from "./subscription.model";

export class SubscriptionRepository extends BaseRepository<ISubscription> {
  constructor() {
    super(Subscription);
  }
}

export const subscriptionRepository = new SubscriptionRepository();
