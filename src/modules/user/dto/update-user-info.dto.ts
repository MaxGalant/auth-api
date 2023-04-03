import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiProperty({ required: false })
  first_name: string;

  @ApiProperty({ required: false })
  second_name: string;

  @ApiProperty({ required: false })
  nickname: string;

  @ApiProperty({ required: false })
  email: string;

  @ApiProperty({ required: false })
  phone_number: string;
}
