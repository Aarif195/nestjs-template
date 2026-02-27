import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100, { message: 'Email is too long' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(50, { message: 'Password is too long' })
  password: string;
}