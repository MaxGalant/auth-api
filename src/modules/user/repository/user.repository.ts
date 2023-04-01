import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  In,
  Repository,
  UpdateResult,
} from 'typeorm';
import { RoleEnum, User } from '../entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { GoogleUserDto } from '../../auth/dto';
import { CreateUserDto, UpdateUserDto } from '../dto';

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

  updateFields(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult>;
  updateRefreshToken(userId: string, token: string): Promise<UpdateResult>;

  findOneByEmailAndActive(email: string): Promise<User>;
  findOneByEmail(email: string): Promise<User>;
  findOneById(id: string): Promise<User>;
  findOneByIdAndRoleUser(id: string): Promise<User>;
  findManyByIdsAndRoleUser(ids: string[]): Promise<User[]>;
  findOneByEmailAndOtp(email: string, otp: string): Promise<User>;
  findOneByOtpAndActive(otp: string): Promise<User>;
  findManyByNameAndRoleUser(name: string): Promise<User[]>;
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

  async findOneByEmailAndActive(email: string): Promise<User> {
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

  async findOneByEmail(email: string): Promise<User> {
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

  async findOneById(id: string): Promise<User> {
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

  async updateFields(
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

  async findOneByEmailAndOtp(email: string, otp: string): Promise<User> {
    this.logger.log(`Finding a user by email: ${email} and otp: ${otp}`);

    try {
      return this.findOne({ where: { email, otp, active: false } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user by email: ${email} and otp: ${otp}`,
        error?.stack,
      );
    }
  }

  async findOneByOtpAndActive(otp: string): Promise<User> {
    this.logger.log(`Finding a user by otp: ${otp} and active`);

    try {
      return this.findOne({ where: { otp, active: true } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user by otp: ${otp} and active`,
        error?.stack,
      );
    }
  }

  async findOneByIdAndRoleUser(id: string): Promise<User> {
    this.logger.log(`Finding a user by id: ${id} and role 'user'`);

    try {
      return this.findOne({ where: { id, role: RoleEnum.USER } });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user by id: ${id} and role 'user'`,
        error?.stack,
      );
    }
  }

  async findManyByIdsAndRoleUser(ids: string[]): Promise<User[]> {
    this.logger.log(`Finding users with ids: ${ids} and role 'user'`);

    try {
      return this.find({
        where: {
          id: In(ids),
          role: RoleEnum.USER,
        },
      });
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding a user by id: ${ids} and role 'user'`,
        error?.stack,
      );
    }
  }

  async findManyByNameAndRoleUser(name: string): Promise<User[]> {
    this.logger.log(`Finding users by name ${name} and role 'user'`);

    try {
      return this.createQueryBuilder('user')
        .where('user.first_name LIKE :name', { name: `%${name}%` })
        .orWhere('user.second_name LIKE :name', { name: `%${name}%` })
        .orWhere('user.nickname LIKE :name', { name: `%${name}%` })
        .getMany();
    } catch (error) {
      this.logger.error(
        `Something went wrong when finding users by name ${name} and role 'user'`,
        error?.stack,
      );
    }
  }
}
