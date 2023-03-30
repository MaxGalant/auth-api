import { User } from '../entity';

export interface UserRequestInterface extends Request {
  user: User;
}
