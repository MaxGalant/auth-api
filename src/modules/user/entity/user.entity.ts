import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  second_name: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  password: string;

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
