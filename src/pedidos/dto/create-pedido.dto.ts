import { IsNotEmpty, IsNumber, IsString, Min} from "class-validator"

export class CreatePedidoDto {
        @IsNotEmpty()
        @IsNumber()
        @Min(1, { message: 'La cantidad debe ser al menos 1' })
        cantidadGarrafones:number

        @IsNotEmpty()
        @IsString()
        estado?:string

        @IsNotEmpty()
        @IsNumber()
        @Min(1, { message: 'El ID del cliente es requerido' })
        clienteId: number;
        
}
