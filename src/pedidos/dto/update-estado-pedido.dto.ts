import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEstadoPedidoDto {
    @IsNotEmpty()
    @IsString()
    estado: string;
}