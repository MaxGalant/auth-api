import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import { ErrorDto } from '../utills/error.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<any | ErrorDto> {
    return this.userService.createUser(createUserDto);
  }
}
