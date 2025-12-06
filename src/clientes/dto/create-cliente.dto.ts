import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateClienteDto {

    @IsNotEmpty()
    @IsString()
    nombre: string; // El front envía "nombre"

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    telefono: string;

    @IsNotEmpty()
    @IsEmail()
    @IsOptional()
    correo?: string;

    @IsNotEmpty()
    @IsNumber()
    tipoPrecioId: number;

    @IsNotEmpty()
    @IsString()
    calle: string;

    @IsNotEmpty()
    @IsString()
    colonia: string;

    @IsOptional()
    @IsString()
    referencia?: string;

    @IsOptional()
    @IsNumber()
    latitud?: number;

    @IsOptional()
    @IsNumber()
    longitud?: number;

    @IsOptional()
    cte?: number;

    @IsOptional()
    negocio?: string;

    @IsInt()
    @IsOptional()
    diaRutaId?: number;
}