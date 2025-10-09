import { IsEmail, IsNotEmpty, IsString, Length, MaxLength } from "class-validator";

export class UpdateClienteDto {
     @IsNotEmpty()
        @Length(3,20)
        @IsString()
        nombre:string
    
        @IsNotEmpty()
        @IsString()
        @MaxLength(15)
        telefono: string;
    
        @IsString()
        @IsNotEmpty()
        @IsEmail()
        correo:string
}
