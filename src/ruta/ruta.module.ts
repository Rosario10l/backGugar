import { Module } from '@nestjs/common';
import { RutasService } from './ruta.service';
import { RutasController } from './ruta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ruta } from './entities/ruta.entity';
import { AuthModule } from 'src/auth/auth/auth.module';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
// import { Cliente } from 'src/clientes/entities/cliente.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ruta, 
      Usuario, 
      // Cliente  
    ]),
    AuthModule, 
  ],
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}