import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Please enter field: firstName' })
  @IsString({ message: 'Invalid type' })
  firstName: string;

  @IsNotEmpty({ message: 'Please enter field: secondName' })
  @IsString({ message: 'Invalid type' })
  secondName: string;

  @IsNotEmpty({ message: 'Please enter field: nickname' })
  @IsString({ message: 'Invalid type' })
  nickname: string;

  @IsNotEmpty({ message: 'Please enter field: email' })
  @IsEmail(
    {},
    {
      message: 'Invalid email format. Please enter a valid email address.',
    },
  )
  email: string;

  @IsNotEmpty({ message: 'Please enter field: password' })
  @IsString({ message: 'Invalid type' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Invalid type' })
  phoneNumber?: string;
}
