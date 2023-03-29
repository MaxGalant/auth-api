import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../config/customConfig.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IUserRepository,
  UserRepository,
} from '../../user/repository/user.repository';
import { JwtTokenConfigDto } from '../../../config/dto/jwt-token-config.dto';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  private readonly tokenConfig: JwtTokenConfigDto;

  constructor(
    private readonly configService: CustomConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    const config = configService.getAccessTokenConfig();

    super({
      secretOrKey: configService.getAccessTokenPublicKey(),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.aud,
      issuer: config.iss,
      algorithms: ['RS256'],
    });
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
