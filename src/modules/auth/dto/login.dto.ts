import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Please enter field: email' })
  @IsEmail(
    {},
    {
      message: 'Invalid email format. Please enter a valid email address.',
    },
  )
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Please enter field: password' })
  @IsString({ message: 'Invalid type' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
  })
  password: string;
}
