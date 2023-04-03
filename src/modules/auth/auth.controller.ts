import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ErrorDto } from '../../utills';
import { CreateUserDto, UserProfileInfoDto } from '../user/dto';
import { LoginDto, ResendOtpDto, SetNewPasswordDto, VerifyOtpDto } from './dto';
import { AuthService } from './auth.service';
import { TokenOutputDto } from './dto';
import { RefreshTokenGuard } from './gurds';
import { Request } from 'express';
import { GoogleAuthGuard } from './gurds/google-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Create a user',
    description: "Returns an user's profile info or error.",
  })
  @ApiBody({
    description: 'Set fields for crating',
    type: CreateUserDto,
  })
  @ApiOkResponse({
    description: 'User successfully crated',
    type: UserProfileInfoDto,
  })
  @ApiConflictResponse({
    description: 'User with email already exists in system',
    type: ErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid password',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when create user',
    type: ErrorDto,
  })
  @Post('sign-up')
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Returns tokens or error.',
  })
  @ApiBody({
    description: 'Set email and password',
    type: LoginDto,
  })
  @ApiOkResponse({
    description: 'User successfully logins',
    type: TokenOutputDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid password or email',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when user with email login',
    type: ErrorDto,
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenOutputDto | ErrorDto> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Refresh tokens',
    description: 'Returns tokens or error.',
  })
  @ApiOkResponse({
    description: 'Tokens successfully refreshed',
    type: TokenOutputDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when refreshing user's token",
    type: ErrorDto,
  })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: Request): Promise<TokenOutputDto> {
    return this.authService.refresh(req);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    return 'success';
  }

  @ApiOperation({
    summary: 'Create or login user by google',
    description: 'Returns tokens.',
  })
  @ApiOkResponse({
    description: 'User successfully logins',
    type: TokenOutputDto,
  })
  @ApiNotFoundResponse({
    description: "User from google doesn't exist",
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when  user login by Google',
    type: ErrorDto,
  })
  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req): Promise<TokenOutputDto | ErrorDto> {
    return this.authService.googleLogin(req);
  }

  @ApiOperation({
    summary: 'Verify otp',
    description: "Returns an user's profile info or error.",
  })
  @ApiBody({
    description: 'Set otp and email',
    type: VerifyOtpDto,
  })
  @ApiOkResponse({
    description: 'User successfully verified',
    type: UserProfileInfoDto,
  })
  @ApiNotFoundResponse({
    description: 'Invalid otp',
    type: ErrorDto,
  })
  @ApiConflictResponse({
    description: 'Otp expired',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when verifying user's otp",
    type: ErrorDto,
  })
  @Post('verify-otp')
  verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @ApiOperation({
    summary: 'Resend otp',
    description: 'Returns string and an ok staus or error.',
  })
  @ApiBody({
    description: 'Set email',
    type: ResendOtpDto,
  })
  @ApiOkResponse({
    description: 'Otp was successfully resend',
    type: String,
  })
  @ApiNotFoundResponse({
    description: "User with email doesn't exists",
    type: ErrorDto,
  })
  @ApiConflictResponse({
    description: 'Otp expired',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when resending otp'",
    type: ErrorDto,
  })
  @Post('resend-otp')
  resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<string | ErrorDto> {
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @ApiOperation({
    summary: 'Forgot password',
    description: 'Returns string and an ok status or error.',
  })
  @ApiBody({
    description: 'Set otp and password',
    type: SetNewPasswordDto,
  })
  @ApiOkResponse({
    description: 'Password successfully updated',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Invalid otp',
    type: ErrorDto,
  })
  @ApiConflictResponse({
    description: 'Otp expired',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when setting a new user's password",
    type: ErrorDto,
  })
  @Post('set-new-password')
  setNewPassword(
    @Body() setNewPasswordDto: SetNewPasswordDto,
  ): Promise<string | ErrorDto> {
    return this.authService.setNewPassword(
      setNewPasswordDto.otp,
      setNewPasswordDto.password,
    );
  }
}
