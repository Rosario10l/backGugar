import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { ClienteRuta } from 'src/ruta/entities/cliente-ruta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Precio, ClienteRuta])
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService]
})
export class VentasModule {}