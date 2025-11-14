import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacione.entity';
import { AuthModule } from 'src/auth/auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion]),
    AuthModule // Importa AuthModule para que el AuthGuard funcione
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}