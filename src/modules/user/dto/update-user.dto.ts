import { PartialType } from '@nestjs/swagger';
import { User } from '../entity';

export class UpdateUserDto extends PartialType(User) {}
