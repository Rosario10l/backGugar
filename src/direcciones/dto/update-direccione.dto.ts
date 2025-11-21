import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class UpdateDireccioneDto  {
        @IsOptional()
        @Length(3,30)
        @IsString()
        direccion:string

        @IsOptional()
        @Length(3,30)
        @IsString()
        colonia:string

        @IsOptional()
        @Length(3,8)
        @IsNumber()
        codigoPostal:number

        @IsOptional()
        @Length(3,50)
        @IsString()
        ciudad:string

        @IsOptional()
        @IsNumber()
        latitud:number
        
        @IsOptional()
        @IsNumber()
        longitud:number
}

