import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Precio } from 'src/precios/entities/precio.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Cliente, Precio])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [TypeOrmModule]
})
export class ClientesModule {}
