import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, MaxLength } from "class-validator";

export class CreateClienteDto {
    @IsNotEmpty()
    @Length(3,20)
    @IsString()
    nombre:string

    @IsNotEmpty()
    @IsString()
    @MaxLength(15)
    telefono: string;

    @IsNumber()
    @IsNotEmpty()
    cte:number

    
    @IsString()
    negocio:string

    @IsNotEmpty()
    @IsNumber()
    tipoPrecioId: number;
}
