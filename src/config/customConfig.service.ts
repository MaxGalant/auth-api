import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { GoogleCredentialsDto } from './dto/google-credentials.dto';
import { JwtTokenConfigDto } from './dto/jwt-token-config.dto';

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
    return this.getEnvVariableValue('PRIVATE_KEY');
  }

  public getAccessTokenPublicKey(): string {
    return this.getEnvVariableValue('PUBLIC_KEY');
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
}
const configService = new CustomConfigService(process.env);

export { configService };
