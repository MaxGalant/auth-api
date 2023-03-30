import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../config/customConfig.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IUserRepository,
  UserRepository,
} from '../../user/repository/user.repository';
import { Request } from 'express';
import { User } from '../../user/entity';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private readonly configService: CustomConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    const tokenConfig = configService.getAccessTokenConfig();

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getRefreshTokenSecretKey(),
      passReqToCallback: true,
      audience: tokenConfig.aud,
      issuer: tokenConfig.iss,
    });
  }
  async validate(req: Request, payload: any): Promise<User> {
    const token = req.body.refreshToken.split('.')[2];

    const user = await this.userRepository.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (token !== user.refresh_token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
