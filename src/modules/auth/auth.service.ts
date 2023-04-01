import { Injectable, Logger } from '@nestjs/common';
import {
  IUserRepository,
  UserRepository,
} from '../user/repository/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto';
import { ErrorDto } from '../../utills/error.dto';
import { User } from '../user/entity';
import * as bcrypt from 'bcrypt';
import { TokenOutputDto } from './dto';
import { CustomConfigService } from '../../config/customConfig.service';
import { UserService } from '../user/user.service';
import { UserProfileInfoDto } from '../user/dto';
import { MailService } from '../mail/mail.service';
import { plainToClass } from 'class-transformer';

export interface IAuthService {
  validateUser(loginDto: LoginDto): Promise<User | ErrorDto>;
  getTokenPair(user: User): Promise<TokenOutputDto>;
  login(loginDto: LoginDto): Promise<any>;
  refresh(req): Promise<TokenOutputDto>;
  setNewPassword(otp: string, password: string): Promise<string | ErrorDto>;
}

@Injectable()
export class AuthService implements IAuthService {
  private logger = new Logger('Auth Service');
  private hashSalt = 10;

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: IUserRepository,
    private readonly accessTokenService: JwtService,
    private readonly refreshTokenService: JwtService,
    private readonly configService: CustomConfigService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {
    const accessTokenPrivateKey = configService.getAccessTokenPrivateKey();
    const accessTokenPublicKey = configService.getAccessTokenPublicKey();
    const accessTokenAuthConfig = configService.getAccessTokenConfig();

    this.accessTokenService = new JwtService({
      privateKey: accessTokenPrivateKey,
      publicKey: accessTokenPublicKey,
      signOptions: {
        issuer: accessTokenAuthConfig.iss,
        audience: accessTokenAuthConfig.aud,
        expiresIn: accessTokenAuthConfig.exp,
        algorithm: 'RS256',
      },
    });

    const refreshTokenSecret = configService.getRefreshTokenSecretKey();
    const refreshTokenAuthConfig = configService.getRefreshTokenConfig();

    this.refreshTokenService = new JwtService({
      secret: refreshTokenSecret,
      signOptions: {
        issuer: refreshTokenAuthConfig.iss,
        audience: refreshTokenAuthConfig.aud,
        expiresIn: refreshTokenAuthConfig.exp,
      },
    });
  }

  public async validateUser(loginDto: LoginDto): Promise<User | ErrorDto> {
    const user = await this.userRepository.findOneByEmailAndActive(
      loginDto.email,
    );

    if (!user) {
      return new ErrorDto(401, 'Unauthorized', `Invalid password or email`);
    }

    const match = await bcrypt.compare(loginDto.password, user.password);

    if (!match) {
      return new ErrorDto(401, 'Unauthorized', `Invalid password or email`);
    }

    return user;
  }

  public async getTokenPair(user: User): Promise<TokenOutputDto> {
    const accessTokenPayload = {
      sub: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        secondName: user.second_name,
        role: user.role,
      },
    };

    const refreshTokenPayload = {
      id: user.id,
    };

    const refreshToken = await this.refreshTokenService.signAsync(
      refreshTokenPayload,
    );

    const accessToken = await this.accessTokenService.signAsync(
      accessTokenPayload,
    );

    const tokenSignature = refreshToken.split('.')[2];

    await this.userRepository.updateRefreshToken(user.id, tokenSignature);

    return {
      refreshToken,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<TokenOutputDto | ErrorDto> {
    this.logger.log('User login');

    try {
      const user = await this.validateUser(loginDto);

      if (user instanceof ErrorDto) {
        return user;
      }

      return this.getTokenPair(user);
    } catch (error) {
      this.logger.error(
        `Something went wrong when user with email: ${loginDto.email} login`,
        error?.stack,
      );
    }
  }

  async refresh(req): Promise<TokenOutputDto> {
    this.logger.log("Refreshing user's tokens");

    try {
      const { user } = req;

      return this.getTokenPair(user);
    } catch (error) {
      this.logger.error(
        `Something went wrong when refreshing user's token`,
        error?.stack,
      );
    }
  }

  async googleLogin(req) {
    this.logger.log('Login user by google');

    try {
      const googleUser = req.user;

      const user = await this.userService.createGoogleUser(googleUser);

      if (user instanceof ErrorDto) {
        return user;
      }

      return this.getTokenPair(user);
    } catch (error) {
      this.logger.error(
        'Something went wrong when  user login by Google',
        error?.stack,
      );

      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when  user login by Google',
      );
    }
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    this.logger.log("Verifying user's otp");

    try {
      const user = await this.userRepository.findOneByEmailAndOtp(email, otp);

      if (!user) {
        return new ErrorDto(404, 'Not Found', `Invalid otp`);
      }

      if (user.otp_lifetime < new Date()) {
        return new ErrorDto(409, 'Conflict', `Otp expired`);
      }

      await this.userRepository.updateFields(user.id, {
        active: true,
      });

      return plainToClass(UserProfileInfoDto, user);
    } catch (error) {
      this.logger.error(
        "Something went wrong when verifying user's otp",
        error?.stack,
      );

      return new ErrorDto(
        500,
        'Server error',
        "Something went wrong when verifying user's otp",
      );
    }
  }

  async resendOtp(email: string): Promise<string | ErrorDto> {
    this.logger.log('Resending a new otp to user');

    try {
      const user = await this.userRepository.findOneByEmail(email);

      if (!user) {
        return new ErrorDto(
          404,
          'Not Found',
          `User with email: ${email} doesn't exists`,
        );
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const mailSubject = 'Otp code';

      const mailText = `Your new otp: ${newOtp}`;

      await this.mailService.sendEmail(email, mailSubject, mailText);

      await this.userRepository.updateFields(user.id, {
        otp: newOtp,
        otp_lifetime: new Date(new Date().getTime() + 15 * 60000),
      });

      return 'Otp was successfully resend';
    } catch (error) {
      this.logger.error(
        'Something went wrong when  user login by Google',
        error?.stack,
      );

      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when  user login by Google',
      );
    }
  }

  async setNewPassword(
    otp: string,
    password: string,
  ): Promise<string | ErrorDto> {
    this.logger.log("Setting a new user's password");

    try {
      const user = await this.userRepository.findOneByOtpAndActive(otp);

      if (!user) {
        return new ErrorDto(404, 'Not Found', `Invalid otp`);
      }

      if (user.otp_lifetime < new Date()) {
        return new ErrorDto(409, 'Conflict', `Otp expired`);
      }

      const newPassword = await bcrypt.hash(password, this.hashSalt);

      await this.userRepository.updateFields(user.id, {
        password: newPassword,
      });

      return 'Password successfully updated';
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        "Something went wrong when setting a new user's password",
      );
    }
  }
}
