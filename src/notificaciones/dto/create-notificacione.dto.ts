import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNotificacionDto {

  @IsNumber()
  @IsNotEmpty()
  idReceptor: number;

  @IsString()
  @IsNotEmpty()
  contenido: string;
}
