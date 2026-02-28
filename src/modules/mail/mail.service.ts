import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly brevoApiKey: string;
    private readonly senderEmail: string;
    private readonly senderName: string;

    constructor(private config: ConfigService) {
        this.brevoApiKey = this.config.get<string>('BREVO_API_KEY')!.trim();
        this.senderEmail = this.config.get<string>('MAIL_SENDER_EMAIL')!;
        this.senderName = this.config.get<string>('MAIL_SENDER_NAME')!;
    }

    async sendMail(to: string, subject: string, html: string, customSenderName?: string) {
        try {
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": this.brevoApiKey
                },
                body: JSON.stringify({
                    sender: {
                        name: customSenderName || this.senderName,
                        email: this.senderEmail
                    },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || response.statusText);
            }

            return data;
        } catch (error) {
            throw new InternalServerErrorException(`Email failed: ${error.message}`);
        }
    }
}