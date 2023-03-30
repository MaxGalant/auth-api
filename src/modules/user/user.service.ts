import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UserProfileInfoDto } from './dto';
import { IUserRepository, UserRepository } from './repository/user.repository';
import { ErrorDto } from '../../utills/error.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { GoogleUserDto } from '../auth/dto';
import { MailService } from '../mail/mail.service';
import { UserRequestInterface } from './interfaces';

export interface IUserService {
  createUser(
    createUserDto: CreateUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto>;
  createGoogleUser(
    googleUserDto: GoogleUserDto,
  ): Promise<UserProfileInfoDto | ErrorDto>;
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

      const user = await this.userRepository.findByEmail(email);

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

      return plainToClass(UserProfileInfoDto, newUser);
    } catch (error) {
      this.logger.error('Something went wrong when create user', error?.stack);

      await queryRunner.startTransaction();

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

      const user = await this.userRepository.findByEmail(googleUserDto.email);

      if (user && user.active) {
        return plainToClass(UserProfileInfoDto, user);
      } else if (user && !user.active) {
        const activatedUser = this.userRepository.updateUserFields(user.id, {
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

      await queryRunner.startTransaction();

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

      if (!user) {
        return new ErrorDto(404, 'Not Found', `User doesn't exist`);
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return new ErrorDto(401, 'Unauthorized', `Invalid password`);
      }

      const newHashedPassword = await bcrypt.hash(newPassword, this.hashSalt);

      await this.userRepository.updateUserFields(user.id, {
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
}
