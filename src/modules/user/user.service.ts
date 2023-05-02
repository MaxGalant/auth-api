import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserInfoDto, UserProfileInfoDto } from './dto';
import { IUserRepository, UserRepository } from './repository/user.repository';
import { ErrorDto } from '../../utills';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from '../auth/dto';
import { MailService } from '../mail/mail.service';
import { UserRequestInterface } from './interfaces';
import { User } from './entity';
import { ClientProxy } from '@nestjs/microservices';

export interface IUserService {
  createUser(
    createUserDto: CreateUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto>;
  createGoogleUser(
    googleUserDto: GoogleUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto>;
  updatePassword(
    req: UserRequestInterface,
    oldPassword: string,
    newPassword: string,
  ): Promise<string | ErrorDto>;
  updateInfo(
    req: UserRequestInterface,
    updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<string | ErrorDto>;
  getById(userId: string): Promise<User | ErrorDto>;
  getByIds(userId: string[]): Promise<UserProfileInfoDto[] | ErrorDto>;
  search(name: string): Promise<UserProfileInfoDto[] | ErrorDto>;
}

@Injectable()
export class UserService implements IUserService {
  private logger = new Logger('User Service');

  private hashSalt = 10;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    @Inject('RABBITMQ_SERVER')
    private readonly rabbit: ClientProxy,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    this.logger.log('User creating');

    const queryRunner = this.dataSource.createQueryRunner();

    const { manager } = queryRunner;

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const { email, password } = createUserDto;

      const user = await this.userRepository.findOneByEmail(email);

      if (user) {
        return new ErrorDto(
          409,
          'Conflict',
          `User with email already exists ${email} in system`,
        );
      }

      const hashPassword = await bcrypt.hash(password, this.hashSalt);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const mailSubject = 'Otp code';

      const mailText = `Your otp: ${otp}`;

      await this.mailService.sendEmail(
        createUserDto.email,
        mailSubject,
        mailText,
      );

      const newUser = await this.userRepository.saveUser(
        createUserDto,
        hashPassword,
        otp,
        manager,
      );

      await queryRunner.commitTransaction();

      await this.rabbit
        .send('create_user', {
          id: newUser.id,
          first_name: newUser.first_name,
          second_name: newUser.second_name,
          nickname: newUser.nickname,
        })
        .subscribe();

      return plainToClass(UserProfileInfoDto, newUser);
    } catch (error) {
      this.logger.error('Something went wrong when create user', error?.stack);

      await queryRunner.rollbackTransaction();

      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when create user',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createGoogleUser(
    googleUserDto: GoogleUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    const { manager } = queryRunner;

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      if (!googleUserDto) {
        return new ErrorDto(404, 'Not Found', `User from google doesn't exist`);
      }

      const user = await this.userRepository.findOneByEmail(
        googleUserDto.email,
      );

      if (user && user.active) {
        return plainToClass(UserProfileInfoDto, user);
      } else if (user && !user.active) {
        const activatedUser = this.userRepository.updateFields(user.id, {
          first_name: googleUserDto.firstName,
          second_name: googleUserDto.lastName,
          active: true,
        });

        return plainToClass(UserProfileInfoDto, activatedUser);
      }

      const newUser = await this.userRepository.saveGoogleUser(
        googleUserDto,
        manager,
      );

      await queryRunner.commitTransaction();

      return plainToClass(UserProfileInfoDto, newUser);
    } catch (error) {
      this.logger.error(
        'Something went wrong when  user login by Google',
        error?.stack,
      );

      await queryRunner.rollbackTransaction();

      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when  user login by Google',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(
    req: UserRequestInterface,
    oldPassword: string,
    newPassword: string,
  ): Promise<string | ErrorDto> {
    this.logger.log("Updating a user's password");

    try {
      const { user } = req;

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return new ErrorDto(400, 'Unauthorized', `Invalid password`);
      }

      const newHashedPassword = await bcrypt.hash(newPassword, this.hashSalt);

      await this.userRepository.updateFields(user.id, {
        password: newHashedPassword,
      });

      return 'Password successfully updated';
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        "Something went wrong when updating a  user's password",
      );
    }
  }

  async updateInfo(
    req: UserRequestInterface,
    updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<string | ErrorDto> {
    this.logger.log("Updating a user's profile indo");
    try {
      const { user } = req;

      await this.userRepository.updateFields(user.id, updateUserInfoDto);

      return "User's profile info successfully updated";
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        "Something went wrong when updating a user's profile info",
      );
    }
  }

  async getById(userId: string): Promise<UserProfileInfoDto | ErrorDto> {
    this.logger.log('Getting a user by id"');
    try {
      const user = await this.userRepository.findOneByIdAndRoleUser(userId);

      if (!user) {
        return new ErrorDto(
          404,
          'Not Found',
          `User with id:${userId} doesn't exist`,
        );
      }

      return plainToClass(UserProfileInfoDto, user);
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when getting a user by id',
      );
    }
  }

  async getByIds(usersIds: string[]): Promise<UserProfileInfoDto[] | ErrorDto> {
    this.logger.log('Getting users by ids"');
    try {
      const users = await this.userRepository.findManyByIdsAndRoleUser(
        usersIds,
      );

      return plainToClass(UserProfileInfoDto, users);
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        'Something went wrong when getting users by ids',
      );
    }
  }

  async search(name: string): Promise<UserProfileInfoDto[] | ErrorDto> {
    this.logger.log(`Searching users by name: ${name}`);

    try {
      const users = await this.userRepository.findManyByNameAndRoleUser(name);

      return plainToClass(UserProfileInfoDto, users);
    } catch (error) {
      return new ErrorDto(
        500,
        'Server error',
        `Something went wrong when searching users by name: ${name}`,
      );
    }
  }
}
