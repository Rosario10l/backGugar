import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateRutaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  idRepartidor: number; 
  @IsString()
  @IsNotEmpty()
  lugarEntrega: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsString()
  @IsOptional()
  acciones?: string;

  @IsArray()
  @IsNotEmpty()
  coordenadas: any[]; 
}