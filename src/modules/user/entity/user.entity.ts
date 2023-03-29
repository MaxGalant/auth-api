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

  @Column({
    nullable: false,
  })
  first_name: string;

  @Column({
    nullable: false,
  })
  second_name: string;

  @Column({
    nullable: false,
  })
  nickname: string;

  @Column({
    unique: true,
    length: 100,
    nullable: false,
  })
  email: string;

  @Column({
    length: 150,
    nullable: false,
  })
  password: string;

  @Column({
    nullable: true,
    length: 12,
  })
  phone_number: string;

  @Column()
  otp: string;

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
