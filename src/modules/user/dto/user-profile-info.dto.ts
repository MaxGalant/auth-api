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
  otp_lifetime: Date;

  @Exclude()
  active: boolean;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;
}
