import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateVentaDto{
        @IsOptional()
        @IsNumber()
        @Min(1, { message: 'El ID del cliente es requerido' })
        clienteRutaId: number;
    
        @IsOptional()
        @IsNumber()
        @Min(1, { message: 'La cantidad vendida debe ser al menos 1' })
        cantidadVendida: number;
    
        @IsOptional()
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
