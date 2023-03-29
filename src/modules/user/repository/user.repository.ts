import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';
import { User } from '../entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GoogleUserDto } from '../../auth/dto/google-user.dto';

export interface IUserRepository {
  saveUser(
    createUserDto: CreateUserDto,
    password: string,
    otp: string,
    manager: EntityManager,
  ): Promise<User>;
  saveGoogleUser(
    googleUserPayload: GoogleUserDto,
    manager: EntityManager,
  ): Promise<User>;

  updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult>;
  updateRefreshToken(userId: string, token: string): Promise<UpdateResult>;

  findByEmailAndActive(email: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findById(id: string): Promise<User>;
}

@Injectable()
export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  private logger = new Logger('User Repository');

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async saveUser(
    createUserDto: CreateUserDto,
    password: string,
    otp: string,
    manager: EntityManager,
  ): Promise<User> {
    this.logger.log('Saving a user');

    try {
      const saveUserObj = {
        first_name: createUserDto.firstName,
        second_name: createUserDto.secondName,
        nickname: createUserDto.nickname,
        email: createUserDto.email,
        password,
        otp,
        phone_number: createUserDto.phoneNumber || null,
      };

      return manager.save(User, saveUserObj);
    } catch (error) {
      this.logger.error('Something went wrong when save user', error?.stack);
    }
  }

  async findByEmailAndActive(email: string): Promise<User> {
    this.logger.log(`Finding an active user with email:${email}`);

    try {
      return this.findOne({ where: { email, active: true } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding an active user with email:${email}`,
        error?.stack,
      );
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

  async updateRefreshToken(
    userId: string,
    token: string,
  ): Promise<UpdateResult> {
    this.logger.log(`Updating a user's refresh token`);

    try {
      return this.update({ id: userId }, { refresh_token: token });
    } catch (error) {
      this.logger.error(
        `Something went wrong when updating a user's refresh token`,
        error?.stack,
      );
    }
  }

  async findById(id: string): Promise<User> {
    this.logger.log(`Finding a user by id: ${id}`);

    try {
      return this.findOne({ where: { id, active: true } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user by id: ${id}`,
        error?.stack,
      );
    }
  }

  async saveGoogleUser(
    googleCreateUserPayload: GoogleUserDto,
    manager: EntityManager,
  ): Promise<User> {
    this.logger.log(
      `Saving a google user with email: ${googleCreateUserPayload.email}`,
    );

    try {
      return manager.save(User, {
        first_name: googleCreateUserPayload.firstName,
        second_name: googleCreateUserPayload.lastName,
        email: googleCreateUserPayload.email,
      });
    } catch (error) {
      this.logger.error(
        `Something went wrong when saving a google user with email: ${googleCreateUserPayload.email}`,
        error?.stack,
      );
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    this.logger.log(`Updating a user with id:${userId}`);

    try {
      return this.update({ id: userId }, updateUserDto);
    } catch (error) {
      this.logger.error(
        `Something went wrong when updating a user with id:${userId}`,
        error?.stack,
      );
    }
  }
}
