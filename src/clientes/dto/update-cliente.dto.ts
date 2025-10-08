import { IsEmail, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class UpdateClienteDto {
     @IsNotEmpty()
        @Length(3,20)
        @IsString()
        nombre:string
    
        @IsNotEmpty()
        @Length(3,15)
        @IsNumber()
        telefono:number
    
        @IsString()
        @IsNotEmpty()
        @IsEmail()
        correo:string
}
