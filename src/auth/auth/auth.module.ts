// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    UsuariosModule,
    
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'MI_SECRETO_TEMPORAL_123456', 
        signOptions: {
          expiresIn: 3600, 
        },
      }),
    }),
    
    TypeOrmModule.forFeature([Usuario]),
    UsuariosModule
  ],
  controllers: [AuthController],
  
  providers: [AuthService, JwtStrategy],
  
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}