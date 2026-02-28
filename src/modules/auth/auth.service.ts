import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from '../../common/utils/helpers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword
      },
    });


    // Send Welcome Email
    try {
      await this.mailService.sendMail(
        dto.email,
        'Welcome to our platform!',
        `<p>Hi ${dto.firstName},</p>
       <p>Thank you for registering with us. You can now login to your account.</p>
       <p>Best regards,</p>
       <p>${process.env.MAIL_SENDER_NAME || 'Our Team'}</p>`,
      );
      
    } catch (error) {
      console.error('Email failed to send:', error.message);
    }

    return this.generateUserToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateUserToken(user);
  }

  private generateUserToken(user: any) {
    const payload = { id: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token: this.jwtService.sign(payload),
    };
  }
}