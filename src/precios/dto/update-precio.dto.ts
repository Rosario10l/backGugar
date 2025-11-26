import { IsNumber, IsOptional, IsString, Length} from "class-validator";

export class UpdatePrecioDto {
            @IsOptional()
            @Length(3,20)
            @IsString()
            tipoCompra:string
    
            @IsOptional()
            @IsNumber()
            precioPorGarrafon:number
}
