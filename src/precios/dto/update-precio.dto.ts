import { IsNumber, IsOptional, IsString, Length} from "class-validator";

export class UpdatePrecioDto {
            @IsOptional()
            @Length(3,20)
            @IsString()
            tipoCompra:string
    
            @IsOptional()
            @Length(3,20)
            @IsNumber()
            precioPorGarrafon:number
}
