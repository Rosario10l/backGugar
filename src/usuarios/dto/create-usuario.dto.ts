import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsEnum } from "class-validator";
import { Role } from "src/auth/enums/role.enum";

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()  
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role:Role;
}
