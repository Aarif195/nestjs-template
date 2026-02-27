import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, {
    message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^\+?\d{7,15}$/, { message: 'Phone must be a valid number' })
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  role?: 'student' | 'owner' | 'superadmin';
}