import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomConfigService } from '../../../config/customConfig.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IUserRepository,
  UserRepository,
} from '../../user/repository/user.repository';
import { User } from '../../user/entity';
import { ErrorDto } from '../../../utills/error.dto';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: CustomConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {
    const tokenConfig = configService.getAccessTokenConfig();

    super({
      secretOrKey: configService.getAccessTokenPublicKey(),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: tokenConfig.aud,
      issuer: tokenConfig.iss,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userRepository.findOneById(payload.sub.id);

    if (!user) {
      throw new ErrorDto(404, 'Not Found', `User doesn't exist`);
    }

    return user;
  }
}
