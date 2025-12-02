import { IsNumber, IsOptional, IsEnum } from 'class-validator';

export class AsignarPersonalDto {
  @IsNumber()
  rutaId: number;

  @IsNumber()
  @IsOptional()
  supervisorId?: number;

  @IsNumber()
  @IsOptional()
  repartidorId?: number;
}