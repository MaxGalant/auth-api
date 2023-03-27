import { Module } from '@nestjs/common';
import { CustomConfigService, configService } from './customConfig.service';

@Module({
  providers: [
    {
      provide: CustomConfigService,
      useValue: configService,
    },
  ],
  exports: [CustomConfigService],
})
export class CustomConfigModule {}
