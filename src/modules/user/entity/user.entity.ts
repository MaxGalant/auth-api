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
    length: 30,
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
