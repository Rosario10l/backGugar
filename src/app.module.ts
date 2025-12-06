import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { RutasModule } from './ruta/ruta.module';
import { AuthModule } from './auth/auth/auth.module';

import { PedidosModule } from './pedidos/pedidos.module';
import { ClientesModule } from './clientes/clientes.module';
import { PreciosModule } from './precios/precios.module';
import { VentasModule } from './ventas/ventas.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa ConfigModule para poder inyectar ConfigService
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE'), // 'mysql'
        host: configService.get<string>('DB_HOST'), // 'localhost'
        port: parseInt(configService.get<string>('DB_PORT') ?? '3306', 10),
        username: configService.get<string>('DB_USERNAME'), // 'root'
        password: configService.get<string>('DB_PASSWORD'), // ''
        database: configService.get<string>('DB_DATABASE'), // 'gugar_db'

        autoLoadEntities: true,
        synchronize: true, // ¡Solo usar true en desarrollo!
      }),
      inject: [ConfigService], // Especifica el servicio a inyectar en useFactory
    }),
    UsuariosModule,
    NotificacionesModule,
    RutasModule,
    AuthModule,
    ScheduleModule.forRoot(),
    PedidosModule,
    ClientesModule,
    PreciosModule,
    VentasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
