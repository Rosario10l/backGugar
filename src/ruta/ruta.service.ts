import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Role } from 'src/auth/enums/role.enum';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { DiaRuta } from './entities/dia-ruta.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Injectable()
export class RutasService {
  //diaRutaRepo: any;
  //rutaRepo: any;

  constructor(
    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>, // Nombre oficial

    @InjectRepository(DiaRuta)
    private diaRutaRepository: Repository<DiaRuta>, // Nombre oficial

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>, // Nombre oficial

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>, // Nombre oficial
  ) {}

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const { idRepartidor, ...rutaData } = createRutaDto;

    // 1. Validar que el repartidor exista
    const repartidor = await this.usuarioRepository.findOneBy({
      id: idRepartidor,
    });

    if (!repartidor) {
      throw new NotFoundException(
        `Usuario repartidor con ID ${idRepartidor} no encontrado`,
      );
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

async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientes',
        'diasRuta.clientes.tipoPrecio',
      ],
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
      const nuevoRepartidor = await this.usuarioRepository.findOneBy({
        id: idRepartidor,
      });
      if (!nuevoRepartidor) {
        throw new NotFoundException(
          `Usuario repartidor con ID ${idRepartidor} no encontrado`,
        );
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
  async crearRutaConDia(data: any) {
    // Buscar Clientes
    const clientesEncontrados = await this.clienteRepository.find({
      where: { id: In(data.clientesIds) }
    });

    // Crear Día
    // Usamos this.diaRutaRepository (NO diaRutaRepo)
    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      clientes: clientesEncontrados
    });

    // Crear Ruta Padre
    const nuevaRuta = this.rutaRepository.create({
      nombre: data.nombre,
      supervisorId: data.supervisorId || null,
      idRepartidor: data.repartidorId || null,
      diasRuta: [nuevoDia] // Relación cascada
    });

    return await this.rutaRepository.save(nuevaRuta);
  }

 async agregarDiaARuta(data: any) {
    const ruta = await this.rutaRepository.findOneBy({ id: data.rutaId });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    const clientesEncontrados = await this.clienteRepository.find({
      where: { id: In(data.clientesIds) }
    });

    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      clientes: clientesEncontrados,
      ruta: ruta
    });

    return await this.diaRutaRepository.save(nuevoDia);
  }
  // === OBTENER TODO (Para ver que funcionó) ===
  async findAll(): Promise<Ruta[]> {
    return this.rutaRepository.find({
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientes',
        'diasRuta.clientes.tipoPrecio',
      ],
    });
  }
  async cambiarEstadoDia(idDia: number, nuevoEstado: string) {
    // Usamos diaRutaRepository
    await this.diaRutaRepository.update(idDia, { estado: nuevoEstado });
    return { message: `Estado actualizado a ${nuevoEstado}` };
  }
}
