import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UserProfileInfoDto } from './dto';
import { IUserRepository, UserRepository } from './repository/user.repository';
import { ErrorDto } from '../../utills/error.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<any>;
}

@Injectable()
export class UserService implements IUserService {
  private logger = new Logger('User Service');

  private hashSalt = 10;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly dataSource: DataSource,
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
          `User with email already exist ${email} in system`,
        );
      }

      const hashPassword = await bcrypt.hash(password, this.hashSalt);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
}
