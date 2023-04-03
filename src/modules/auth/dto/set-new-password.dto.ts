import { ApiProperty } from '@nestjs/swagger';

export class SetNewPasswordDto {
  @ApiProperty()
  otp: string;

  @ApiProperty()
  password: string;
}
