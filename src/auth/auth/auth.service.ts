// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto'; 

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}


  async signUp(dto: AuthCredentialsDto): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const usuario = this.usuarioRepository.create({
      email: dto.email,
      password: hashedPassword,
    });

    try {
      await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error.code === '23505') { 
        throw new ConflictException('El nombre de usuario ya existe');
      }
      throw error;
    }
  }

  async signIn(dto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    const { email, password } = dto;
    
    const usuario = await this.usuarioRepository.findOneBy({ email });

    if (usuario && (await bcrypt.compare(password, usuario.password))) {
      
      const payload = { username: usuario.email, sub: usuario.id };
      const accessToken = this.jwtService.sign(payload);
      
      return { accessToken };
    }
    
    throw new UnauthorizedException('Credenciales incorrectas');
  }
}