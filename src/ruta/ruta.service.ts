import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
import { Role } from 'src/auth/enums/role.enum';
import { UpdateRutaDto } from './dto/update-ruta.dto';

@Injectable()
export class RutasService {

  constructor(
    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>,

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const { idRepartidor, ...rutaData } = createRutaDto;

    // 1. Validar que el repartidor exista
    const repartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });
    
    if (!repartidor) {
      throw new NotFoundException(`Usuario repartidor con ID ${idRepartidor} no encontrado`);
    }
    
    // 2. Opcional: Validar que tenga el rol correcto (si tu Enum usa 'repartidor')
    if (repartidor.role !== Role.REPARTIDOR) {
       // Puedes descomentar esto si quieres ser estricto
       // throw new BadRequestException(`El usuario ${repartidor.name} no es un repartidor`);
    }

    // 3. Crear la ruta relacionando al usuario
    const nuevaRuta = this.rutaRepository.create({
      ...rutaData,
      repartidor: repartidor,               
    });

    return this.rutaRepository.save(nuevaRuta);
  }

  findAll(): Promise<Ruta[]> {
    // 'relations' carga los datos del repartidor automáticamente
    return this.rutaRepository.find({ relations: ['repartidor'] });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: ['repartidor'],
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return ruta;
  }
  async update(id: number, updateRutaDto: UpdateRutaDto): Promise<Ruta> {
    const ruta = await this.findOne(id);
    
    const { idRepartidor, ...rest } = updateRutaDto;

    if (idRepartidor) {
      const nuevoRepartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });
      if (!nuevoRepartidor) {
         throw new NotFoundException(`Usuario repartidor con ID ${idRepartidor} no encontrado`);
      }
      ruta.repartidor = nuevoRepartidor;
    }

    this.rutaRepository.merge(ruta, rest);
    return this.rutaRepository.save(ruta);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.rutaRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }

    return { message: `Ruta #${id} eliminada correctamente` };
  }
}