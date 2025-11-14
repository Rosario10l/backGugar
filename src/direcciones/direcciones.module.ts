import { Module } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { DireccionesController } from './direcciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccione } from './entities/direccione.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Direccione, Cliente])],
  controllers: [DireccionesController],
  providers: [DireccionesService],
})
export class DireccionesModule {}
