import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { CustomConfigService } from '../../../config/customConfig.service';
import { GoogleCredentialsDto } from '../../../config/dto/google-credentials.dto';
import { GoogleUserDto } from '../dto/google-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: CustomConfigService) {
    const googleCredentials: GoogleCredentialsDto =
      configService.getGoogleCredentials();

    super({
      clientID: googleCredentials.clientID,
      clientSecret: googleCredentials.clientSecret,
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
