import { IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateClienteDto {
        @IsOptional()
        @IsString()
        representante?: string;

        @IsOptional()
        @IsString()
        @MaxLength(15)
        telefono?: string;

        @IsOptional()
        @IsNumber()
        cte?: number;

        @IsOptional()
        @IsString()
        negocio?: string;

        @IsOptional()
        @IsNumber()
        tipoPrecioId?: number;
}