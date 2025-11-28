import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateClienteRutaDto {
  @IsInt()
  idCliente: number;

  @IsInt()
  diaRutaId: number; // ← CAMBIO: de rutaId a diaRutaId

  @IsInt()
  precioId: number;

  @IsOptional()
  @IsBoolean()
  esCredito?: boolean;

  @IsOptional()
  @IsBoolean()
  requiereFactura?: boolean;
}