import { BaseRepository } from "../../core/base.repository";
import { INotification, Notification } from "./notification.model";

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

export const notificationRepository = new NotificationRepository();
