import { IsNumber, IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class DividirRutaDto {
    @IsNumber()
    @IsNotEmpty() // Es bueno forzar que no sean null/undefined
    rutaId: number;

    @IsNumber()
    @IsNotEmpty()
    diaRutaId: number;

    @IsNumber()
    @IsNotEmpty()
    puntoCorte: number;

    @IsString() // <--- AGREGADO O CONFIRMADO ESTE CAMPO
    @IsNotEmpty()
    diaSemana: string; // Este campo no se usa en el service, pero debe estar en el DTO
}

export class SubRutaResultDto {
    totalClientes: number;
    distanciaKm: number;
    tiempoMinutos: number;
    clientes: number[]; // IDs de clientes
}

export class DividirRutaResponseDto {
    mensaje: string;
    subRutaA: SubRutaResultDto;
    subRutaB: SubRutaResultDto;
}