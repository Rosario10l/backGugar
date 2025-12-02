// src/rutas/dto/add-cliente-ruta.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddClienteRutaDto {
  @IsNumber()
  @IsNotEmpty()
  idCliente: number;
}