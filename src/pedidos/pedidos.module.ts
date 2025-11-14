import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Precio } from 'src/precios/entities/precio.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Pedido, Cliente, Precio])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
