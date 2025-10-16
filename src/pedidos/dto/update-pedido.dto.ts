import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdatePedidoDto {
            @IsOptional()
            @IsNumber()
            cantidadGarrafones:number
    
            @IsOptional()
            @IsString()
            estado:string
    
            @IsOptional()
            @IsNumber()
            total:number
}
