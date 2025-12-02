import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RutasController } from './ruta.controller';
import { RutasService } from './ruta.service';

// Entities
import { Ruta } from './entities/ruta.entity';
import { ClienteRuta } from './entities/cliente-ruta.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { Direccione } from 'src/direcciones/entities/direccione.entity';
import { DiaRuta } from './entities/dia-ruta.entity';
import { Venta } from 'src/ventas/entities/venta.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ruta,
      ClienteRuta,
      Cliente,
      Usuario,
      Precio,
      Direccione,
      DiaRuta,
      Venta  
    ])
  ],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService]
})
export class RutasModule {}