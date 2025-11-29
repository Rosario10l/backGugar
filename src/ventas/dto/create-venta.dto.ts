import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from "class-validator";

export class CreateVentaDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'El ID del cliente es requerido' })
    clienteRutaId: number;

    @IsNotEmpty()
    @IsNumber()
    @ValidateIf((o) => o.estado !== 'saltado')
    @Min(1, { message: 'La cantidad vendida debe ser al menos 1' })
    cantidadVendida: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'El ID del precio es requerido' })
    precioId: number;

    @IsOptional()
    @IsNumber()
    total?: number;

    @IsOptional()
    @IsEnum(['realizado', 'saltado', 'pendiente'])
    estado?: string;

    @IsOptional()
    @IsString()
    motivoSalto?: string;
}