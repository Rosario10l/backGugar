import { Module } from '@nestjs/common';
import { PreciosService } from './precios.service';
import { PreciosController } from './precios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Precio } from './entities/precio.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Precio])],
  controllers: [PreciosController],
  providers: [PreciosService],
})
export class PreciosModule {}
