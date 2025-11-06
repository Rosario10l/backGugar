import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator"

export class CreateDireccioneDto {
        @IsNotEmpty()
        @Length(3,30)
        @IsString()
        calle:string

        @IsNotEmpty()
        @Length(1,6)
        @IsNumber()
        numero:number

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
        clienteId: number;
}
