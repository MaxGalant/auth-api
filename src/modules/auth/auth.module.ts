import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from '../user/repository/user.repository';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomConfigModule } from '../../config/customConfig.module';
import { UserModule } from '../user/user.module';
import { AccessTokenStrategy, GoogleStrategy } from './strategies';
import { RefreshTokenStrategy } from './strategies';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'accessToken' }),
    JwtModule.register({}),
    UserModule,
    CustomConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
