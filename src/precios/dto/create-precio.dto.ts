import { IsNotEmpty, IsNumber, IsString, Length, Max, Min } from "class-validator";

export class CreatePrecioDto {
        @IsNotEmpty()
        @Length(3, 20)
        @IsString()
        tipoCompra: string

        @IsNotEmpty()
        @IsNumber()
        @Min(0)      
        @Max(9999.99)
        precioPorGarrafon: number
}
