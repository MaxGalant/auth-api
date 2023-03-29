import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../config/customConfig.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IUserRepository,
  UserRepository,
} from '../../user/repository/user.repository';
import { JwtTokenConfigDto } from '../dto';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  private readonly tokenConfig: JwtTokenConfigDto;

  constructor(
    private readonly configService: CustomConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      secretOrKey: configService.getAccessTokenPublicKey(),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH_AUDIENCE,
      issuer: process.env.AUTH_ISS,
      algorithms: ['RS256'],
    });

    this.tokenConfig = configService.getAccessTokenConfig();
  }

  async validate(payload: any) {
    if (
      !payload ||
      payload.aud !== this.tokenConfig.aud ||
      payload.iss !== this.tokenConfig.iss
    ) {
      throw new UnauthorizedException();
    }

    return this.userRepository.findById(payload.sub.id);
  }
}
