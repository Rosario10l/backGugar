import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, MaxLength } from "class-validator";

export class UpdateClienteDto {
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

        @IsNotEmpty()
        @IsString()
        negocio:string

        @IsNotEmpty()
        @IsNumber()
        tipoPrecioId: number;
}
