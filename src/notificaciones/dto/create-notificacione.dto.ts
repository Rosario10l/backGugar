import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateNotificacioneDto {
    @IsString()
    @IsNotEmpty()
    contenido: string;

    @IsNumber()
    @IsNotEmpty()
    remitenteId: number;

}
