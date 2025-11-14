
import { IsString, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}