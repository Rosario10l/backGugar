import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Precio } from './entities/precio.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Pedido, Precio, Cliente])],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
