import { PartialType } from "@nestjs/mapped-types"
import { IsNumber, IsOptional, IsString } from "class-validator"
import { CreatePedidoDto } from "./create-pedido.dto"

export class UpdatePedidoDto extends PartialType(CreatePedidoDto){
            @IsOptional()
            @IsNumber()
            cantidadGarrafones:number
    
            @IsOptional()
            @IsString()
            estado:string
}
