import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppSettings } from 'src/app.settings';
import { Email } from './entities/email.entity';

const EMAIL_SUBJECT = {
  VERIFY_EMAIL: 'Account verification',
  VERIFY_CHANGE_PASSWORD: 'Reset your password',
};

@Injectable()
export class MailService {
  transporter: nodemailer.Transporter;
  PREFIX_EMAIL_SUBJECT = 'AirBnB';
  from: string;
  to: string;
  frontendHost: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly appSettings: AppSettings,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_SERVER'),
      debug: false,
      auth: {
        user: this.configService.get('SMTP_USERNAME'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
    this.from =
      this.configService.get('ADMIN_EMAIL') || this.appSettings.smtp.username;
    this.frontendHost = this.configService.get('FRONTEND_HOST');
  }

  sendVerifyEmail(code: string, email: string): void {
    let subject = `${this.PREFIX_EMAIL_SUBJECT} - ${EMAIL_SUBJECT.VERIFY_EMAIL}`;
    if (this.appSettings.production != 'production') {
      subject += ` ${this.appSettings.production}`;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: email,
      subject: subject,
      html: `
            <p>Welcome to AirBnb!</p>
            <p>Before you can use your account you will need to verify your email address. Please click the link below to activate your account.</p>
            <a href="${this.frontendHost}/auth/verification/${code}">Link</a><br>
            <p>Thank you!</p>
            `,
    };

    this.transporter.sendMail(mailOptions);
  }

  sendForgotPassword(token: string, email: string, fullName: string): void {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: email,
      subject: `${this.PREFIX_EMAIL_SUBJECT} - ${EMAIL_SUBJECT.VERIFY_CHANGE_PASSWORD}`,
      html: `<p>Hi ${fullName}, we have just received a request to reset your password.</p>
             <p>If you did not request this change please ignore this email. If you did request it, you can reset your password by using the link below.</p> 
             <a href="${this.frontendHost}/reset-password/${token}">Reset password</a>
             <p>Thank you!</p>
            `,
    };

    this.transporter.sendMail(mailOptions);
  }

  async sendTestEmail(email: string): Promise<any> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: email,
      subject: `${this.PREFIX_EMAIL_SUBJECT}`,
      html: `<p>This is a test email. Please do not reply.</p>
             <p>Thank you!</p>
            `,
    };
    const { info } = await this.sendMail(mailOptions);
    return info;
  }

  private async sendMail(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<{ info: any; email: Email }> {
    const mail = await this.composeMail(mailOptions);
    //insert into mail db.
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (err: Error | null, info: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({ info, email: mail });
        }
      });
    });
  }

  private composeMail(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<Email> {
    return Promise.resolve(new Email());
  }
}
