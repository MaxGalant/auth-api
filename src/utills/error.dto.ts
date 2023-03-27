export class ErrorDto {
  statusCode: number;

  error: string;

  message: string;

  constructor(statusCode: number, error: string, message: string) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
  }
}
