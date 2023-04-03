import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByIdsDto {
  @ApiProperty()
  ids: string[];
}
