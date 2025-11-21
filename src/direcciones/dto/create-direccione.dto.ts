import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator"

export class CreateDireccioneDto {
        @IsNotEmpty()
        @Length(3,30)
        @IsString()
        direccion:string

        @IsNotEmpty()
        @Length(3,30)
        @IsString()
        colonia:string

        @IsNotEmpty()
        @Length(3,8)
        @IsNumber()
        codigoPostal:number

        @IsNotEmpty()
        @Length(3,50)
        @IsString()
        ciudad:string

        @IsNotEmpty()
        @IsNumber()
        latitud:number

        @IsNotEmpty()
        @IsNumber()
        longitud:number

        @IsNotEmpty()
        @IsNumber()
        clienteId: number;
}
