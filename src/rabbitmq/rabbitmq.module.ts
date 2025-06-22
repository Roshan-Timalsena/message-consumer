import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { Notification } from 'src/notification/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]), // <-- This makes NotificationRepository available
  ],
  controllers: [],
  providers: [RabbitMQService, Notification],
  exports: [],
})
export class RabbitMQModule {}
