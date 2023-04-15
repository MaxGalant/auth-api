import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);

  const logger = new Logger();

  const port = configService.get<number>('PORT', 3000);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Sync In Auth Service')
    .setDescription('The Sync In is Hroza-bydlo team product')
    .setVersion('1.0')
    .addTag('Sync In Auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    logger.log(`Server running on port: ${port}`, 'Server');
  });
}

bootstrap();
