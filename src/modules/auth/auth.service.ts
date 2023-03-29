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

export interface IAuthService {
  validateUser(loginDto: LoginDto): Promise<User | ErrorDto>;
  getTokenPair(user: User): Promise<TokenOutputDto>;
  login(loginDto: LoginDto): Promise<any>;
  refresh(req): Promise<TokenOutputDto>;
}

@Injectable()
export class AuthService implements IAuthService {
  private logger = new Logger('Auth Service');

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: IUserRepository,
    private readonly accessTokenService: JwtService,
    private readonly refreshTokenService: JwtService,
    private readonly configService: CustomConfigService,
    private readonly userService: UserService,
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
    const user = await this.userRepository.findByEmailAndActive(loginDto.email);

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
}
