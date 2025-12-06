import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { DiaRuta } from 'src/ruta/entities/dia-ruta.entity';
import { ClienteRuta } from 'src/ruta/entities/cliente-ruta.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Cliente, Precio, DiaRuta, ClienteRuta ])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [TypeOrmModule]
})
export class ClientesModule {}
