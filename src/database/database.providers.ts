import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        migrationsTableName: 'migrations',
        synchronize: false,
        entities: ['dist/**/entity/*.entity{.js,.ts}'],
        migrations: ['dist/migrations/*{.js,.ts}'],
      });

      const logger: Logger = new Logger();

      try {
        await dataSource.initialize();

        logger.log('Database connection established successfully', 'Database');
      } catch (error) {
        logger.error(
          `Failed to connect to database: ${error.message}`,
          'Database',
        );
      }

      return dataSource;
    },
  },
];
