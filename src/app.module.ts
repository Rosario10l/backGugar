import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionesModule } from './direcciones/direcciones.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gugar_db',
      autoLoadEntities:true,
      synchronize: true, 
    }),
    DireccionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
