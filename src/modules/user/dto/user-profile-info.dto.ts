import { User } from '../entity';
import { Exclude } from 'class-transformer';

export class UserProfileInfoDto extends User {
  @Exclude()
  password: string;
  @Exclude()
  refresh_token: string;
  @Exclude()
  otp: string;

  @Exclude()
  active: boolean;
}
