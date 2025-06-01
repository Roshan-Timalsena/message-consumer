import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/notification/notification.entity';

@Injectable()
export class RabbitMQService implements OnApplicationBootstrap {
  private channel: any;
  private connection: any;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting RabbitMQ connection...');
    await this.connect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue('notifications', { durable: true });

      this.logger.log('Connected to RabbitMQ');
      this.consumeNotifications();
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error.stack);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private consumeNotifications() {
    this.channel.consume('notifications', async (msg) => {
      if (!msg) return;

      let content: any;

      try {
        content = JSON.parse(msg.content.toString());
        this.logger.debug(`Processing notification: ${content?.id}`);

        console.log(`Sending to user ${content?.user_id}: ${content?.message}`);

        await this.notificationRepo.update(content.id, {
          status: 'processed',
          updatedAt: new Date(),
        });

        this.channel.ack(msg);
        this.logger.log(`Notification ${content?.id} processed successfully`);
      } catch (error) {
        await this.handleFailure(content?.id);
        this.logger.error(`Processing failed: ${error.message}`);
        this.channel.nack(msg, false, false);
      }
    });

    this.logger.log('Started consuming messages from "notifications" queue');
  }

  private async handleFailure(id: number) {
    const notification = await this.notificationRepo.findOne({
      where: { id },
    });

    if (!notification) {
      console.error(`Notification with ID ${id} not found`);
      return;
    }

    const currentRetryCount = notification?.retryCount ?? 0;

    if (currentRetryCount < 3) {
      await this.notificationRepo.update(id, {
        retryCount: currentRetryCount + 1,
      });
    } else {
      await this.notificationRepo.update(id, {
        status: 'failed',
      });
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Closing RabbitMQ connection...');
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
