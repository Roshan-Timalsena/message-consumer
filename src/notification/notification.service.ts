import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async getRecent(limit: number) {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .orderBy('notification.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async getSummary() {
    const result = await this.notificationRepo
      .createQueryBuilder('notification')
      .select([
        'COUNT(notification.id) AS total',
        'SUM(CASE WHEN notification.status = :status THEN 1 ELSE 0 END) AS processed',
      ])
      .setParameter('status', 'processed')
      .getRawOne();

    return {
      total: result ? parseInt(result.total) : 0,
      processed: result ? parseInt(result.processed) : 0,
    };
  }
}
