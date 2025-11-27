import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, MaxLength, Min } from "class-validator";

export class CreateClienteDto {
    // --- DATOS PERSONALES ---
    @IsNotEmpty()
    @Length(3, 50) // Le di un poco más de espacio
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    telefono: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    correo: string;

    // --- RELACIÓN PRECIO (Esto se queda igual) ---
    @IsNotEmpty()
    @IsNumber()
    tipoPrecioId: number;

    // --- NUEVOS CAMPOS: DOMICILIO 🏠 ---
    @IsNotEmpty()
    @IsString()
    calle: string;

    @IsNotEmpty()
    @IsString()
    colonia: string;

    @IsOptional() // La referencia puede ser opcional
    @IsString()
    referencia?: string;

    // --- COORDENADAS GPS (Para el mapa) 🗺️ ---
    // Son opcionales al crear si no seleccionan mapa, 
    // pero recomendables. Tú decides si poner @IsNotEmpty
    @IsOptional() 
    @IsNumber()
    latitud?: number;

    @IsOptional()
    @IsNumber()
    longitud?: number;
}