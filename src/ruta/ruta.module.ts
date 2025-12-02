import { Module } from '@nestjs/common';
import { RutasService } from './ruta.service';
import { RutasController } from './ruta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from './entities/ruta.entity';
import { AuthModule } from 'src/auth/auth/auth.module';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
import { DiaRuta } from './entities/dia-ruta.entity'; // <--- ¡ESTA FALTABA SEGURO!
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ruta, 
      Usuario, 
      Cliente,
      DiaRuta,  
    ]),
    AuthModule, 
  ],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [RutasService]
})
export class RutasModule {}