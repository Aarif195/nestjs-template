import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  STUDENT = 'student',
  OWNER = 'hostelOwner',
}

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;
}