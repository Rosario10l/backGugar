import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateClienteDto {
    // FRONTEND ENVÍA 'nombre', 'telefono', 'correo', 'tipoPrecioId', 'calle', 'colonia'...

    @IsNotEmpty()
    @IsString()
    nombre: string; // El front envía "nombre"

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    telefono: string;

    @IsNotEmpty()
    @IsEmail()
    correo: string;

    @IsNotEmpty()
    @IsNumber()
    tipoPrecioId: number;

    // DIRECCIÓN (El front las envía directas)
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
    
    // Opcionales que el front NO envía, pero la entidad podría pedir
    @IsOptional()
    cte?: number; 

    @IsOptional()
    negocio?: string;
}