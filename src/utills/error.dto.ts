import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  constructor(statusCode: number, error: string, message: string) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
  }
}
