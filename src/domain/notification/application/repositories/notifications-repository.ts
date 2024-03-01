import { Notification } from '../../enterprise/entities/notification'

export interface NotificationsRepository {
  findById(id: string): Promise<Notification | null>
  create(notification: Notification): Promise<Notification>
  save(notification: Notification): Promise<Notification>
}
