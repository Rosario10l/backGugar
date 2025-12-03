import { IsEmail, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateClienteDto { 
    @IsOptional()
    @IsString()
    representante?: string;

    @IsOptional()
    @IsString()
    @MaxLength(15)
    telefono?: string;

    @IsOptional()
    @IsString()
    correo?: string;

    @IsOptional()
    @IsNumber()
    cte?: number;

    @IsOptional()
    @IsString()
    negocio?: string;

    @IsOptional()
    @IsNumber()
    tipoPrecioId?: number;

    // --- ¡AGREGA ESTOS CAMPOS QUE FALTAN! ---
    @IsOptional()
    @IsString()
    calle?: string;

    @IsOptional()
    @IsString()
    colonia?: string;

    @IsOptional()
    @IsString()
    referencia?: string;

    @IsOptional()
    @IsNumber()
    latitud?: number;

    @IsOptional()
    @IsNumber()
    longitud?: number;
}