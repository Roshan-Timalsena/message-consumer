import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification/notification.entity';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        database: process.env.DB_NAME || 'test',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        entities: [Notification],
        timezone: 'Z',
        synchronize: false,
        debug: false,
      }),
    }),

    RabbitMQModule,
  ],
})
export class AppModule {}
