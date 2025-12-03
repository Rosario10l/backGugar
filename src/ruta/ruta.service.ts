import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { DiaRuta, EstadoDiaRuta } from './entities/dia-ruta.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { ClienteRuta } from './entities/cliente-ruta.entity'; // <--- Importante
import { Precio } from 'src/precios/entities/precio.entity';   // <--- Importante

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Ruta) private rutaRepository: Repository<Ruta>,
    @InjectRepository(DiaRuta) private diaRutaRepository: Repository<DiaRuta>,
    @InjectRepository(Cliente) private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(ClienteRuta) private clienteRutaRepository: Repository<ClienteRuta>,
    @InjectRepository(Precio) private precioRepository: Repository<Precio>,
  ) {}

  // --- CRUD BÁSICO (Compatible con tu compañero) ---
  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const { idRepartidor, ...rutaData } = createRutaDto;
    let repartidor: Usuario | null = null;
    if (idRepartidor) {
        repartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });
    }
    const nuevaRuta = this.rutaRepository.create({
      ...rutaData,
      repartidor: repartidor || undefined,
    });
    return this.rutaRepository.save(nuevaRuta);
  }

  async findAll(): Promise<Ruta[]> {
    return this.rutaRepository.find({
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
      ],
    });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
        'diasRuta.clientesRuta.cliente.tipoPrecio',
      ],
    });
    if (!ruta) throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    return ruta;
  }

  async update(id: number, updateRutaDto: UpdateRutaDto): Promise<Ruta> {
    const ruta = await this.findOne(id);
    const { idRepartidor, ...rest } = updateRutaDto;
    if (idRepartidor) {
      const nuevoRepartidor = await this.usuarioRepository.findOneBy({
        id: idRepartidor,
      });
      if (nuevoRepartidor) ruta.repartidor = nuevoRepartidor;
    }
    this.rutaRepository.merge(ruta, rest);
    return this.rutaRepository.save(ruta);
  }

  async remove(id: number): Promise<{ message: string }> {
    // Lógica de borrado en cascada manual si es necesario, o dejar que la BD lo haga
    const result = await this.rutaRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    return { message: `Ruta #${id} eliminada correctamente` };
  }

  // === MÉTODOS ADAPTADOS (PARA QUE FUNCIONE TU MODAL) ===

  async crearRutaConDia(data: any) {
    // 1. BUSCAR PERSONAL (Esto es lo que faltaba para asegurar la relación)
    let supervisor: Usuario | null = null;
    let repartidor: Usuario | null = null;

    if (data.supervisorId) {
      supervisor = await this.usuarioRepository.findOneBy({ id: data.supervisorId });
    }

    if (data.repartidorId) {
      repartidor = await this.usuarioRepository.findOneBy({ id: data.repartidorId });
    }

    // 2. Crear Día (primero vacío)
    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      estado: EstadoDiaRuta.PENDIENTE,
    });

    // 3. Crear Ruta Padre (Asignando las ENTIDADES completas)
    const nuevaRuta = this.rutaRepository.create({
      nombre: data.nombre,
      supervisor: supervisor || undefined, // <--- Usamos el objeto
      repartidor: repartidor || undefined, // <--- Usamos el objeto
      diasRuta: [nuevoDia] // Guardamos la ruta y el día
    });

    const rutaGuardada = await this.rutaRepository.save(nuevaRuta);
    
    // Verificamos que se haya guardado el día
    const diaGuardado = rutaGuardada.diasRuta && rutaGuardada.diasRuta.length > 0 
      ? rutaGuardada.diasRuta[0] 
      : null;

    if (!diaGuardado) {
       // Por seguridad, si algo falló con el día
       return rutaGuardada; 
    }

    // 4. ASIGNAR CLIENTES (Usando la tabla intermedia de tu compañero)
    const ids = data.clientesIds || [];
    
    for (const clienteId of ids) {
      const cliente = await this.clienteRepository.findOne({ 
        where: { id: clienteId }, 
        relations: ['tipoPrecio'] 
      });
      
      if (cliente) {
        const clienteRuta = this.clienteRutaRepository.create({
          diaRuta: diaGuardado,
          cliente: cliente,
          precio: cliente.tipoPrecio, // Guardamos el precio actual
          es_credito: false,
          requiere_factura: false,
        });
        await this.clienteRutaRepository.save(clienteRuta);
      }
    }

    return rutaGuardada;
  }
  async agregarDiaARuta(data: any) {
    const ruta = await this.rutaRepository.findOneBy({ id: data.rutaId });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');

    // Crear Día
    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      estado: EstadoDiaRuta.PENDIENTE,
      ruta: ruta,
    });
    const diaGuardado = await this.diaRutaRepository.save(nuevoDia);

    // Asignar Clientes (Tabla Intermedia)
    const ids = data.clientesIds || [];
    for (const clienteId of ids) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: clienteId },
        relations: ['tipoPrecio'],
      });

      if (cliente) {
        const clienteRuta = this.clienteRutaRepository.create({
          diaRuta: diaGuardado,
          cliente: cliente,
          precio: cliente.tipoPrecio,
          es_credito: false,
          requiere_factura: false,
        });
        await this.clienteRutaRepository.save(clienteRuta);
      }
    }

    return diaGuardado;
  }

  // Otros métodos de tu compañero (Los dejé tal cual o stubbed)
  async cambiarEstadoDia(id: number, estado: string) {
    await this.diaRutaRepository.update(id, { estado });
    return { message: 'Estado actualizado' };
  }

  async obtenerClientesDisponibles(diaRutaId?: number) {
    return this.clienteRepository.find({
      relations: ['tipoPrecio', 'direcciones'],
      order: { representante: 'ASC' },
    });
  }
  async asignarPersonalARuta(id: number, dto: any) {
    return this.update(id, dto);
  }
  async iniciarDiaRuta(id: number) {
    return this.cambiarEstadoDia(id, EstadoDiaRuta.EN_CURSO);
  }
  async finalizarDiaRuta(id: number) {
    return this.cambiarEstadoDia(id, EstadoDiaRuta.COMPLETADA);
  }
  async pausarDiaRuta(id: number) {
    return this.cambiarEstadoDia(id, EstadoDiaRuta.PAUSADA);
  }

  async removeClienteFromRuta(idDia: number, idCliente: number) {
    // Lógica para borrar de la tabla intermedia
    const relacion = await this.clienteRutaRepository.findOne({
      where: { diaRuta: { id: idDia }, cliente: { id: idCliente } },
    });
    if (relacion) await this.clienteRutaRepository.remove(relacion);
    return { message: 'Eliminado' };
  }

  async asignarCliente(data: any) {
    return { message: 'Asignado' };
  }
  async importarDesdeExcel(data: any) {
    return { message: 'Importado' };
  }
 
  // Agrega esto al final de tu clase RutasService
  async getRutasPorEstado(estado: string) {
    return [];
  }
  async getDiasRutaPorEstado(estado: string) {
    return [];
  }
  async obtenerRutasRepartidor(repartidorId: number) {
    return [];
  }
}
