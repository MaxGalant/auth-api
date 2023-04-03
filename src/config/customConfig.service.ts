import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { GoogleCredentialsDto, MailgunCredentialsDto } from './dto';
import { JwtTokenConfigDto } from './dto';
import * as fs from 'fs';

config();

export class CustomConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getEnvVariableValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (!value && throwOnMissing) {
      throw new Error(`Missing env.${key}`);
    }

    return value;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getEnvVariableValue('DB_HOST'),
      port: parseInt(this.getEnvVariableValue('DB_PORT')),
      username: this.getEnvVariableValue('DB_USER'),
      password: this.getEnvVariableValue('DB_PASSWORD'),
      database: this.getEnvVariableValue('DB_NAME'),
      migrationsTableName: 'migration',
      entities: ['dist/**/entity/*.entity{.js,.ts}'],
      migrations: ['dist/migrations/*{.js,.ts}'],
    };
  }

  public getAccessTokenConfig(): JwtTokenConfigDto {
    return {
      aud: this.getEnvVariableValue('AUTH_AUDIENCE'),
      iss: this.getEnvVariableValue('AUTH_ISS'),
      exp:
        +this.getEnvVariableValue('AUTH_ACCESS_TOKEN_EXPIRED_TIME', false) ||
        '30m',
      token_type:
        this.getEnvVariableValue('AUTH_TOKEN_TYPE', false) || 'Bearer',
    };
  }

  public getRefreshTokenConfig(): JwtTokenConfigDto {
    return {
      aud: this.getEnvVariableValue('AUTH_AUDIENCE'),
      iss: this.getEnvVariableValue('AUTH_ISS'),
      exp:
        +this.getEnvVariableValue('AUTH_REFRESH_TOKEN_EXPIRED_TIME', false) ||
        '1d',
      token_type:
        this.getEnvVariableValue('AUTH_TOKEN_TYPE', false) || 'Bearer',
    };
  }

  public getAccessTokenPrivateKey(): string {
    const filePath = `${__dirname}/../../keys/private.pem`;

    if (!fs.existsSync(filePath)) {
      return this.getEnvVariableValue('PRIVATE_KEY');
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  public getAccessTokenPublicKey(): string {
    const filePath = `${__dirname}/../../keys/public.pem`;

    if (!fs.existsSync(filePath)) {
      return this.getEnvVariableValue('PUBLIC_KEY');
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  public getRefreshTokenSecretKey(): string {
    return this.getEnvVariableValue('REFRESH_TOKEN_SECRET');
  }

  public getGoogleCredentials(): GoogleCredentialsDto {
    return {
      clientID: this.getEnvVariableValue('GOOGLE_CLIENT_ID'),
      clientSecret: this.getEnvVariableValue('GOOGLE_SECRET'),
    };
  }

  public getMailGunCredentials(): MailgunCredentialsDto {
    return {
      apiKey: this.getEnvVariableValue('MAILGUN_API_KEY'),
      domain: this.getEnvVariableValue('MAILGUN_DOMAIN'),
    };
  }
}
const configService = new CustomConfigService(process.env);

export { configService };
