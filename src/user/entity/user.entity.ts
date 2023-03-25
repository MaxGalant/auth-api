import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEnum } from './role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    length: 50,
  })
  first_name: string;

  @Column({
    nullable: false,
    length: 50,
  })
  second_name: string;

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

  @Column({
    type: 'enum',
    nullable: false,
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;
}
