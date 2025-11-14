import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRutaDto {

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsNotEmpty()
  idRepartidor: number; 
}