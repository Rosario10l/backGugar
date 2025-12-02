import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EstadoDiaRuta } from '../entities/dia-ruta.entity';

export class ActualizarEstadoDto {
  @IsNumber()
  diaRutaId: number;

  @IsEnum(EstadoDiaRuta)
  estado: EstadoDiaRuta;

  @IsOptional()
  fechaInicio?: Date;

  @IsOptional()
  fechaFinalizacion?: Date;
}