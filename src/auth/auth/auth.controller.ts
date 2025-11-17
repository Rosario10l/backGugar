import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service'; // 👈 IMPORTANTE
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  // Inyectamos UsuariosService en lugar de AuthService
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('/login')
  async signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    const { email, password } = authCredentialsDto;
    
    // Llamamos a la función que creamos en el PASO 1
    const user = await this.usuariosService.validarUsuario(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Devolvemos el objeto user para que el frontend lo reciba feliz
    return { user };
  }
}