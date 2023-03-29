import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { CustomConfigService } from '../../../config/customConfig.service';
import { GoogleUserDto } from '../dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: CustomConfigService) {
    super({
      ...configService.getGoogleCredentials(),
      callbackURL: 'http://localhost:3001/api/auth/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<GoogleUserDto> {
    const { name, emails } = profile;

    return {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
  }
}
