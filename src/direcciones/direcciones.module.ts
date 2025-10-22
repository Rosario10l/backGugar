import { Module } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { DireccionesController } from './direcciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccione } from './entities/direccione.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Direccione])],
  controllers: [DireccionesController],
  providers: [DireccionesService],
})
export class DireccionesModule {}
