import { PartialType } from '@nestjs/mapped-types';
import { CreateRutaDto } from './create-ruta.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateRutaDto extends PartialType(CreateRutaDto) {

    @IsNumber()
    @IsOptional()
    idRepartidor?: number; // Repartidor (Usuario)

    // 💡 Añadir idSupervisor
    @IsNumber()
    @IsOptional()
    idSupervisor?: number;
}