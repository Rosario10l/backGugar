import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class UpdateDireccioneDto  {
        @IsOptional()
        @Length(3,30)
        @IsString()
        calle:string

        @IsOptional()
        @Length(1,6)
        @IsNumber()
        numero:number

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
}

