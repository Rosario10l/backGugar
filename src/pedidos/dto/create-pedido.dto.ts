import { IsNotEmpty, IsNumber, IsString} from "class-validator"

export class CreatePedidoDto {
        @IsNotEmpty()
        @IsNumber()
        cantidadGarrafones:number

        @IsNotEmpty()
        @IsString()
        estado:string

        @IsNotEmpty()
        @IsNumber()
        total:number
        
}
