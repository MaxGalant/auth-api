import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ErrorDto } from '../../utills';
import {
  UpdatePasswordDto,
  UpdateUserInfoDto,
  UserProfileInfoDto,
} from './dto';
import { AccessTokenGuard } from '../auth/gurds';
import { UserRequestInterface } from './interfaces';
import { GetUsersByIdsDto } from './dto/get-users-by-ids.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: "Update a user's password",
    description: 'Returns a string and an ok status or error.',
  })
  @ApiBody({
    description: 'Set an old and a new passwords',
    type: UpdatePasswordDto,
  })
  @ApiOkResponse({
    description: 'Password successfully updated',
    type: String,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: "User doesn't exist", type: ErrorDto })
  @ApiBadRequestResponse({
    description: 'Invalid password',
    type: ErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when updating a user's password",
    type: ErrorDto,
  })
  @UseGuards(AccessTokenGuard)
  @Patch('update-password')
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

  @ApiOperation({
    summary: "Update a user's profile info",
    description: 'Returns a string and an ok status or error.',
  })
  @ApiBody({
    description: 'Set fields which need to update',
    type: UpdateUserInfoDto,
  })
  @ApiOkResponse({
    description: "User's profile info successfully updated",
    type: String,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: "User doesn't exist", type: ErrorDto })
  @ApiInternalServerErrorResponse({
    description: "Something went wrong when updating a  user's password",
    type: ErrorDto,
  })
  @UseGuards(AccessTokenGuard)
  @Patch('update-info')
  updateInfo(
    @Req() req: UserRequestInterface,
    @Body() updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<string | ErrorDto> {
    return this.userService.updateInfo(req, updateUserInfoDto);
  }

  @ApiOperation({
    summary: 'Fetching users by ids',
    description: "Returns an array of users' profiles or error.",
  })
  @ApiBody({
    description: 'Set ids of users',
    type: GetUsersByIdsDto,
  })
  @ApiOkResponse({
    description: 'Users fetched successfully by ids',
    type: [UserProfileInfoDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: "User doesn't exist", type: ErrorDto })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when getting users by ids',
    type: ErrorDto,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/get-by-ids')
  getUsersByIds(
    @Body() getUsersByIdsDto: GetUsersByIdsDto,
  ): Promise<UserProfileInfoDto[] | ErrorDto> {
    return this.userService.getByIds(getUsersByIdsDto.ids);
  }

  @ApiOperation({
    summary: 'Searching users who contain name string',
    description: "Returns an array of users' profiles or error.",
  })
  @ApiQuery({
    name: 'name',
    description: 'Set string for searching users',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: 'Users who contain name string',
    type: [UserProfileInfoDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: "User doesn't exist", type: ErrorDto })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when searching users by name',
    type: ErrorDto,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/search')
  searchUser(
    @Query('name') name: string,
  ): Promise<UserProfileInfoDto[] | ErrorDto> {
    return this.userService.search(name);
  }

  @ApiOperation({
    summary: 'Find user by id',
    description: "Returns a user's profile info or error.",
  })
  @ApiParam({
    name: 'id',
    description: 'The id of the user',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserProfileInfoDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: "User doesn't exist", type: ErrorDto })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when getting a user by id',
    type: ErrorDto,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/:id')
  getUserById(
    @Param('id') userId: string,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    return this.userService.getById(userId);
  }
}
