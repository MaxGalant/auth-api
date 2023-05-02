import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { MailModule } from '../mail/mail.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVER',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://root:root@localhost:5672/root'],
          queue: 'test',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    MailModule,
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, UserRepository],
})
export class UserModule {}
