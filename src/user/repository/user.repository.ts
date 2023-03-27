import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entity';
import { CreateUserDto } from '../dto';
import { InjectDataSource } from '@nestjs/typeorm';

export interface IUserRepository {
  saveUser(createUserDto: CreateUserDto, manager: EntityManager): Promise<User>;
  findByEmail(email: string): Promise<User>;
}

@Injectable()
export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  private logger = new Logger('UserRepository');

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async saveUser(
    createUserDto: CreateUserDto,
    manager: EntityManager,
  ): Promise<User> {
    this.logger.log('Saving a user');

    try {
      const saveUserObj = {
        first_name: createUserDto.firstName,
        second_name: createUserDto.secondName,
        nickname: createUserDto.nickname,
        password: createUserDto.password,
        email: createUserDto.email,
        phone_number: createUserDto.phoneNumber || null,
      };

      return manager.save(User, saveUserObj);
    } catch (error) {
      this.logger.error('Something went wrong when save user', error?.stack);
    }
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding a user with email:${email}`);

    try {
      return this.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user with email:${email}`,
        error?.stack,
      );
    }
  }
}
