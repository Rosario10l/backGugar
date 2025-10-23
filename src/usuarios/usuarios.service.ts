import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

async create(data: CreateUsuarioDto): Promise<Usuario> {
    const nuevoUsuario = this.usuarioRepository.create(data);
    return this.usuarioRepository.save(nuevoUsuario);
  }

async  findAll():Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

async  findOne(id: number): Promise<Usuario> {

  const usuario = await this.usuarioRepository.findOneBy({id})
  if(!usuario){
    throw new Error('Usuario no encontrado')
  }
  return usuario
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto):Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({id});
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

async  remove(id: number):Promise<{}>  {
  const result: DeleteResult = await this.usuarioRepository.delete(id);
  if (result.affected === 0) {
      throw new NotFoundException(`El usuario con el ID #${id} no fue encontrado.`);
    }
    return { message: `Usuario con ID #${id} eliminado correctamente.` };
  }
}
