import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger('App');

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('LIVE');

    return this.appService.getHello();
  }
}
