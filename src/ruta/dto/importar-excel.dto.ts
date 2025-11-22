// src/ruta/dto/importar-excel.dto.ts

import { IsString, IsArray, ValidateNested, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ClienteExcelDto {
  @IsString()
  numeroCliente: string;

  @IsString()
  @IsOptional()
  nombreNegocio?: string;

  @IsString()
  representante: string;

  @IsString()
  colonia: string;

  @IsString()
  direccion: string;

  @IsString()
  precioGarrafon: string;

  @IsBoolean()
  @IsOptional()
  esCredito?: boolean;

  @IsBoolean()
  @IsOptional()
  requiereFactura?: boolean;

  @IsString()
  diasVisita: string; // ej: "LJ", "MV", "IS"

  @IsString()
  ordenVisita: string;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsString()
  @IsOptional()
  codigoPostal?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;
}

export class ImportarExcelDto {
  @IsString()
  nombreRuta: string;

  @IsString()
  @IsOptional()
  fechaReporte?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClienteExcelDto)
  clientes: ClienteExcelDto[];
}