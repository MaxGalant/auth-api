import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ErrorDto } from '../../utills/error.dto';
import {
  UpdatePasswordDto,
  UpdateUserInfoDto,
  UserProfileInfoDto,
} from './dto';
import { AccessTokenGuard } from '../auth/gurds';
import { UserRequestInterface } from './interfaces';
import { GetUsersByIdsDto } from './dto/get-users-by-ids.dto';

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

  @UseGuards(AccessTokenGuard)
  @Patch('update-info')
  updateInfo(
    @Req() req: UserRequestInterface,
    @Body() updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<string | ErrorDto> {
    return this.userService.updateInfo(req, updateUserInfoDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/get-by-ids')
  getUsersByIds(
    @Body() getUsersByIdsDto: GetUsersByIdsDto,
  ): Promise<UserProfileInfoDto[] | ErrorDto> {
    return this.userService.getByIds(getUsersByIdsDto.ids);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/search')
  searchUser(
    @Query('name') name: string,
  ): Promise<UserProfileInfoDto[] | ErrorDto> {
    return this.userService.search(name);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/:id')
  getUserById(
    @Param('id') userId: string,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    return this.userService.getById(userId);
  }
}
