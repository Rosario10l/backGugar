
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, 
      secretOrKey: configService.get('JWT_SECRET') || 'MI_SECRETO_TEMPORAL_123456',
    });
  }

  async validate(payload: any): Promise<Usuario> {
    const { name } = payload; 
    const usuario = await this.usuarioRepository.findOneBy({ name });

    if (!usuario) {
      throw new UnauthorizedException('Token inválido');
    }

    return usuario;
  }
}