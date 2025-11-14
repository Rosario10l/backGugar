import { IsNotEmpty, IsNumber, IsString, Length} from "class-validator";

export class CreatePrecioDto {
        @IsNotEmpty()
        @Length(3,20)
        @IsString()
        tipoCompra:string

        @IsNotEmpty()
        @Length(3,20)
        @IsNumber()
        precioPorGarrafon:number
}
