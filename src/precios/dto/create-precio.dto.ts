import { IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';

export class CreatePrecioDto {
  @IsNotEmpty()
  @Length(3, 100)
  @IsString()
  tipoCompra: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precioPorGarrafon: number;
}
