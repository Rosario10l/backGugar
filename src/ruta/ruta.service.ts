import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { DiaRuta, EstadoDiaRuta } from './entities/dia-ruta.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClienteRuta } from './entities/cliente-ruta.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { ImportarExcelDto } from './dto/importar-excel.dto';

@Injectable()
export class RutasService {
  constructor(
    @InjectRepository(Ruta) private rutaRepository: Repository<Ruta>,
    @InjectRepository(DiaRuta) private diaRutaRepository: Repository<DiaRuta>,
    @InjectRepository(Cliente) private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(ClienteRuta) private clienteRutaRepository: Repository<ClienteRuta>,
    @InjectRepository(Precio) private precioRepository: Repository<Precio>,
  ) { }

  // --- CRUD BÁSICO ---
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
    const result = await this.rutaRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    return { message: `Ruta #${id} eliminada correctamente` };
  }

  // === MÉTODOS ADAPTADOS ===

  async crearRutaConDia(data: any) {
    let supervisor: Usuario | null = null;
    let repartidor: Usuario | null = null;

    if (data.supervisorId) {
      supervisor = await this.usuarioRepository.findOneBy({ id: data.supervisorId });
    }

    if (data.repartidorId) {
      repartidor = await this.usuarioRepository.findOneBy({ id: data.repartidorId });
    }

    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      estado: EstadoDiaRuta.PENDIENTE,
    });

    const nuevaRuta = this.rutaRepository.create({
      nombre: data.nombre,
      supervisor: supervisor || undefined,
      repartidor: repartidor || undefined,
      diasRuta: [nuevoDia]
    });

    const rutaGuardada = await this.rutaRepository.save(nuevaRuta);

    const diaGuardado = rutaGuardada.diasRuta && rutaGuardada.diasRuta.length > 0
      ? rutaGuardada.diasRuta[0]
      : null;

    if (!diaGuardado) {
      return rutaGuardada;
    }

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
          precio: cliente.tipoPrecio,
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

    const nuevoDia = this.diaRutaRepository.create({
      diaSemana: data.diaSemana,
      estado: EstadoDiaRuta.PENDIENTE,
      ruta: ruta,
    });
    const diaGuardado = await this.diaRutaRepository.save(nuevoDia);

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

  async cambiarEstadoDia(id: number, estado: string) {
    await this.diaRutaRepository.update(id, { estado });
    return { message: 'Estado actualizado' };
  }

  async obtenerClientesDisponibles(diaRutaId?: number) {
    return this.clienteRepository.find({
      relations: ['tipoPrecio'],
      order: { nombre: 'ASC' },
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
    const relacion = await this.clienteRutaRepository.findOne({
      where: { diaRuta: { id: idDia }, cliente: { id: idCliente } },
    });
    if (relacion) await this.clienteRutaRepository.remove(relacion);
    return { message: 'Eliminado' };
  }

  async marcarClienteVisitado(
    clienteRutaId: number,
    dto: { visitado: boolean; garrafonesVendidos?: number },
  ) {
    const clienteRuta = await this.clienteRutaRepository.findOne({
      where: { id: clienteRutaId },
    });

    if (!clienteRuta) {
      throw new NotFoundException(`ClienteRuta con ID ${clienteRutaId} no encontrado`);
    }

    clienteRuta.visitado = dto.visitado;

    if (dto.garrafonesVendidos !== undefined) {
      clienteRuta.garrafonesVendidos = dto.garrafonesVendidos;
    }

    await this.clienteRutaRepository.save(clienteRuta);

    return {
      message: 'Cliente actualizado',
      visitado: clienteRuta.visitado,
      garrafonesVendidos: clienteRuta.garrafonesVendidos
    };
  }

  // async asignarCliente(data: any) {
  //   return { message: 'Asignado' };
  // }

  // ========================================
  // IMPORTAR DESDE EXCEL - CORREGIDO
  // ========================================
  async importarDesdeExcel(data: ImportarExcelDto) {
    const { fechaReporte, nombreRuta, supervisorId, repartidorId, clientes } = data;

    let clientesCreados = 0;
    let clientesActualizados = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. BUSCAR PERSONAL
      let supervisor: Usuario | undefined = undefined;
      let repartidor: Usuario | undefined = undefined;

      if (supervisorId) {
        const sup = await this.usuarioRepository.findOneBy({ id: supervisorId });
        if (sup) supervisor = sup;
        else warnings.push(`Supervisor ID ${supervisorId} no encontrado`);
      }

      if (repartidorId) {
        const rep = await this.usuarioRepository.findOneBy({ id: repartidorId });
        if (rep) repartidor = rep;
        else warnings.push(`Repartidor ID ${repartidorId} no encontrado`);
      }

      // 2. CREAR LA RUTA PADRE
      const nuevaRuta = this.rutaRepository.create({
        nombre: nombreRuta,
        supervisor,
        repartidor,
      });
      const rutaGuardada = await this.rutaRepository.save(nuevaRuta);

      // 3. AGRUPAR CLIENTES POR DÍA DE VISITA
      const diasMap: Record<string, string> = {
        'LJ': 'Lunes-Jueves',
        'MV': 'Martes-Viernes',
        'IS': 'Miércoles-Sábado'
      };

      const clientesPorDia: Record<string, any[]> = {
        'Lunes-Jueves': [],
        'Martes-Viernes': [],
        'Miércoles-Sábado': []
      };

      for (const clienteData of clientes) {
        const diaKey = diasMap[clienteData.diasVisita] || 'Miércoles-Sábado';
        clientesPorDia[diaKey].push(clienteData);
      }

      // 4. CREAR DÍAS DE RUTA Y ASIGNAR CLIENTES
      const diasCreados: DiaRuta[] = [];

      for (const [diaSemana, clientesDelDia] of Object.entries(clientesPorDia)) {
        if (clientesDelDia.length === 0) continue;

        // Crear el DiaRuta
        const nuevoDia = this.diaRutaRepository.create({
          diaSemana,
          estado: EstadoDiaRuta.PENDIENTE,
          ruta: rutaGuardada,
        });
        const diaGuardado = await this.diaRutaRepository.save(nuevoDia);
        diasCreados.push(diaGuardado);

        // Procesar cada cliente del día
        for (const clienteData of clientesDelDia) {
          try {
            // 4.1 Buscar el PRECIO
            const precioValor = parseFloat(clienteData.precioGarrafon) || 0;
            const precio = await this.precioRepository.findOne({
              where: { precioPorGarrafon: precioValor }
            });

            if (!precio) {
              errors.push(`Precio $${precioValor} no existe para cliente ${clienteData.numeroCliente}`);
              continue;
            }

            // 4.2 Buscar si el cliente ya existe
            const cteNumero = parseInt(clienteData.numeroCliente) || 0;
            let clienteExistente = await this.clienteRepository.findOne({
              where: { cte: cteNumero }
            });

            if (!clienteExistente) {
              // Crear nuevo cliente usando save directo
              const clienteNuevo = new Cliente();
              clienteNuevo.cte = cteNumero;
              clienteNuevo.nombre = clienteData.representante || '';
              clienteNuevo.negocio = clienteData.nombreNegocio || null;
              clienteNuevo.telefono = '';
              clienteNuevo.correo = null;
              clienteNuevo.calle = clienteData.direccion || '';
              clienteNuevo.colonia = clienteData.colonia || '';
              clienteNuevo.referencia = '';
              clienteNuevo.latitud = clienteData.latitud ? parseFloat(String(clienteData.latitud)) : null;
              clienteNuevo.longitud = clienteData.longitud ? parseFloat(String(clienteData.longitud)) : null;
              clienteNuevo.tipoPrecio = precio;

              clienteExistente = await this.clienteRepository.save(clienteNuevo);
              clientesCreados++;
            } else {
              // Actualizar coordenadas si vienen nuevas
              if (clienteData.latitud && clienteData.longitud) {
                clienteExistente.latitud = parseFloat(String(clienteData.latitud));
                clienteExistente.longitud = parseFloat(String(clienteData.longitud));
                await this.clienteRepository.save(clienteExistente);
                clientesActualizados++;
              }
            }

            // 4.3 Crear la relación ClienteRuta
            const clienteRutaNuevo = new ClienteRuta();
            clienteRutaNuevo.cliente = clienteExistente;
            clienteRutaNuevo.diaRuta = diaGuardado;
            clienteRutaNuevo.precio = precio;
            clienteRutaNuevo.es_credito = clienteData.esCredito || false;
            clienteRutaNuevo.requiere_factura = clienteData.requiereFactura || false;
            clienteRutaNuevo.visitado = false;

            await this.clienteRutaRepository.save(clienteRutaNuevo);

          } catch (clienteError: any) {
            errors.push(`Error con cliente ${clienteData.numeroCliente}: ${clienteError.message}`);
          }
        }
      }

      // 5. RESPUESTA
      return {
        success: true,
        message: '✅ Importación completada',
        rutaId: rutaGuardada.id,
        rutasCreadas: 1,
        diasRutaCreados: diasCreados.length,
        clientesCreados,
        clientesActualizados,
        totalClientes: clientes.length,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        detalles: {
          ruta: rutaGuardada.nombre,
          dias: diasCreados.map(d => ({
            id: d.id,
            dia: d.diaSemana,
            clientes: clientesPorDia[d.diaSemana]?.length || 0
          }))
        }
      };

    } catch (error: any) {
      console.error('❌ Error en importación:', error);
      return {
        success: false,
        message: `Error en importación: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  // async getRutasPorEstado(estado: string) {
  //   return [];
  // }

  // async getDiasRutaPorEstado(estado: string) {
  //   return [];
  // }

  async obtenerRutasRepartidor(repartidorId: number) {
    const rutas = await this.rutaRepository.find({
      where: { repartidor: { id: repartidorId } },
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
        'diasRuta.clientesRuta.precio',
      ],
    });

    if (!rutas || rutas.length === 0) {
      return [];
    }

    return rutas;
  }

    async asignarClienteARuta(data: {
    clienteId: number;
    diaRutaId: number;
    precioId: number;
  }) {
    const { clienteId, diaRutaId, precioId } = data;

    // Validar que existan
    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const diaRuta = await this.diaRutaRepository.findOne({ 
      where: { id: diaRutaId },
      relations: ['ruta']
    });
    if (!diaRuta) {
      throw new NotFoundException(`Día de ruta con ID ${diaRutaId} no encontrado`);
    }

    const precio = await this.precioRepository.findOne({ where: { id: precioId } });
    if (!precio) {
      throw new NotFoundException(`Precio con ID ${precioId} no encontrado`);
    }

    // Verificar que no esté ya asignado a este día
    const existente = await this.clienteRutaRepository.findOne({
      where: { 
        cliente: { id: clienteId }, 
        diaRuta: { id: diaRutaId } 
      }
    });

    if (existente) {
      throw new BadRequestException('El cliente ya está asignado a esta ruta');
    }

    // Crear la asignación
    const clienteRuta = this.clienteRutaRepository.create({
      cliente,
      diaRuta,
      precio,
      es_credito: false,
      requiere_factura: false,
      visitado: false,
    });

    await this.clienteRutaRepository.save(clienteRuta);

    return {
      success: true,
      message: 'Cliente asignado a la ruta correctamente',
      clienteRuta: {
        id: clienteRuta.id,
        cliente: cliente.nombre,
        ruta: diaRuta.ruta.nombre,
        dia: diaRuta.diaSemana
      }
    };
  }

  // ========================================
  // DESASIGNAR CLIENTE DE RUTA
  // ========================================
  async desasignarClienteDeRuta(clienteId: number, diaRutaId: number) {
    // Buscar la relación
    const clienteRuta = await this.clienteRutaRepository.findOne({
      where: { 
        cliente: { id: clienteId }, 
        diaRuta: { id: diaRutaId } 
      },
      relations: ['cliente', 'diaRuta', 'diaRuta.ruta']
    });

    if (!clienteRuta) {
      throw new NotFoundException('El cliente no está asignado a esta ruta');
    }

    // Eliminar la asignación
    await this.clienteRutaRepository.remove(clienteRuta);

    return {
      success: true,
      message: 'Cliente desasignado de la ruta correctamente',
      detalles: {
        cliente: clienteRuta.cliente.nombre,
        ruta: clienteRuta.diaRuta.ruta.nombre,
        dia: clienteRuta.diaRuta.diaSemana
      }
    };
  }


}