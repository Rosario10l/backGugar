import { IsNotEmpty, IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { DiasSemana } from '../entities/cliente-ruta.entity';

export class CreateClienteRutaDto {
  @IsNumber()
  @IsNotEmpty()
  idCliente: number;

  @IsNumber()
  @IsNotEmpty()
  rutaId: number;

  @IsNumber()
  @IsNotEmpty()
  precioGarrafon: number;

  @IsEnum(DiasSemana, { message: 'Día inválido. Opciones: Lunes - Jueves, Martes - Viernes...' })
  @IsNotEmpty()
  diaSemana: DiasSemana;

  @IsBoolean()
  @IsOptional()
  esCredito?: boolean;

  @IsBoolean()
  @IsOptional()
  requiereFactura?: boolean;
}