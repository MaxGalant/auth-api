import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from './role.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  first_name: string;

  @ApiProperty()
  @Column()
  second_name: string;

  @ApiProperty()
  @Column({ nullable: true })
  nickname: string;

  @ApiProperty()
  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  password: string;

  @ApiProperty()
  @Column({
    nullable: true,
    length: 12,
  })
  phone_number: string;

  @Column({ nullable: true })
  otp: string;

  @Column({
    type: 'timestamptz',
    default: () =>
      `CURRENT_TIMESTAMP + INTERVAL '15 minutes' AT TIME ZONE 'Europe/Kiev'`,
  })
  otp_lifetime: Date;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ default: false })
  active: boolean;

  @ApiProperty()
  @Column({
    type: 'enum',
    nullable: false,
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => `CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Kiev'`,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => `CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Kiev'`,
  })
  updated_at: Date;
}
