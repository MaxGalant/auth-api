import { Injectable } from '@nestjs/common';
import * as mailgun from 'mailgun-js';
import { CustomConfigService } from '../../config/customConfig.service';

@Injectable()
export class MailService {
  private mg: mailgun.Mailgun;

  constructor(private readonly configService: CustomConfigService) {
    this.mg = mailgun({
      ...configService.getMailGunCredentials(),
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
  ): Promise<mailgun.messages.SendResponse> {
    const data = {
      from: 'eeldd2511@gmail.com',
      to: to,
      subject: subject,
      text: text,
    };

    return await this.mg.messages().send(data);
  }
}
