import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);

  const logger = new Logger();

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port, () => {
    logger.log(`Server running on port: ${port}`, 'Server');
  });
}

bootstrap();
