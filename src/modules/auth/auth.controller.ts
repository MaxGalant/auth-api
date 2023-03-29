import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ErrorDto } from '../../utills/error.dto';
import { CreateUserDto, UserProfileInfoDto } from '../user/dto';
import { LoginDto } from './dto';
import { AuthService } from './auth.service';
import { TokenOutputDto } from './dto';
import { RefreshTokenGuard } from './gurds';
import { Request } from 'express';
import { GoogleAuthGuard } from './gurds/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    return this.userService.createUser(createUserDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<TokenOutputDto | ErrorDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  async refresh(@Req() req: Request): Promise<TokenOutputDto> {
    return this.authService.refresh(req);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  async googleAuth() {
    return 'success';
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}
