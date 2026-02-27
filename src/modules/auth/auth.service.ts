import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from '../../common/utils/helpers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwtService: JwtService,
  ) {}

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