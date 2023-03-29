export class JwtTokenConfigDto {
  aud: string;
  iss: string;
  exp: number | string;
  token_type: string;
}
