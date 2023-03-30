import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ErrorDto } from '../../utills/error.dto';
import { UpdatePasswordDto } from './dto';
import { AccessTokenGuard } from '../auth/gurds';
import { UserRequestInterface } from './interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Post('update-password')
  updatePassword(
    @Req() req: UserRequestInterface,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<string | ErrorDto> {
    return this.userService.updatePassword(
      req,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
    );
  }
}
