import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { CustomConfigModule } from '../../config/customConfig.module';

@Module({
  imports: [CustomConfigModule],
  controllers: [],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
