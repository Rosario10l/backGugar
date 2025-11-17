import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const nuevoUsuario = this.usuarioRepository.create({
      ...data,
      password: hashedPassword,
    });
    try {
      return await this.usuarioRepository.save(nuevoUsuario);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('El correo ya existe');
      throw error;
    }
  }
  async validarUsuario(email: string, pass: string): Promise<any> {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .where('usuario.email = :email', { email })
      .addSelect('usuario.password') 
      .getOne();
    if (usuario && (await bcrypt.compare(pass, usuario.password))) {
      const { password, ...result } = usuario;
      return result;
    }
    return null;
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt();
      updateUsuarioDto.password = await bcrypt.hash(
        updateUsuarioDto.password,
        salt,
      );
    }
    this.usuarioRepository.merge(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<{}> {
    try {
      const result: DeleteResult = await this.usuarioRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Usuario #${id} no encontrado.`);
      }
      
      return { message: `Usuario #${id} eliminado.` };

    } catch (error) {
      if (error.code === '23503') {
        throw new ConflictException('No se puede eliminar este usuario porque está asignado a una ruta.');
      }
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}