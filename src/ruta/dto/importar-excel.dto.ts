import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para cada cliente del Excel
export class ClienteExcelDto {
  @IsString()
  @IsNotEmpty()
  numeroCliente: string;

  @IsString()
  @IsOptional()
  nombreNegocio?: string;

  @IsString()
  @IsNotEmpty()
  representante: string;

  @IsString()
  @IsNotEmpty()
  colonia: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  precioGarrafon: string;

  @IsBoolean()
  @IsOptional()
  esCredito?: boolean;

  @IsBoolean()
  @IsOptional()
  requiereFactura?: boolean;

  @IsString()
  @IsNotEmpty()
  diasVisita: string;

  @IsString()
  @IsNotEmpty()
  ordenVisita: string;

  @IsString()
  @IsNotEmpty()
  supervisor: string;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;
}

// DTO principal para la importación
export class ImportarExcelDto {
  @IsString()
  @IsNotEmpty()
  supervisor: string;

  @IsString()
  @IsOptional()
  fechaReporte?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClienteExcelDto)
  clientes: ClienteExcelDto[];

  @IsString()
  @IsNotEmpty()
  nombreRuta: string;

}