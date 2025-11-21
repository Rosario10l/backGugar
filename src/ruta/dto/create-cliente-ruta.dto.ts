// create-cliente-ruta.dto.ts

import { IsInt, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { DiasSemana } from '../entities/cliente-ruta.entity';

export class CreateClienteRutaDto {
  @IsInt()
  idCliente: number;

  @IsInt()
  rutaId: number;

  // ✅ CAMBIAR DE precioGarrafon A precioId
  @IsInt()
  precioId: number; // ← Ya no es un decimal, es el ID del precio

  @IsEnum(DiasSemana)
  diaSemana: DiasSemana;

  @IsOptional()
  @IsBoolean()
  esCredito?: boolean;

  @IsOptional()
  @IsBoolean()
  requiereFactura?: boolean;
}