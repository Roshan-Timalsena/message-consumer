import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('recent')
  getRecent(@Query('limit') limit = 10) {
    return this.notificationService.getRecent(limit);
  }

  @Get('summary')
  getSummary() {
    return this.notificationService.getSummary();
  }
}
