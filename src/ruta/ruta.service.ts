import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';

import { Ruta } from './entities/ruta.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { ClienteRuta } from './entities/cliente-ruta.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { DiaRuta } from './entities/dia-ruta.entity';
import { Direccione } from 'src/direcciones/entities/direccione.entity';

import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';
import { ImportarExcelDto, ClienteExcelDto } from './dto/importar-excel.dto';
import { DiasSemana, EstadoDiaRuta } from './entities/dia-ruta.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Injectable()
export class RutasService {
  //diaRutaRepo: any;
  //rutaRepo: any;

  constructor(
    @InjectRepository(DiaRuta)
    private diaRutaRepository: Repository<DiaRuta>,

    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>, // Nombre oficial

    @InjectRepository(DiaRuta)
    private diaRutaRepository: Repository<DiaRuta>, // Nombre oficial

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>, // Nombre oficial

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,

    @InjectRepository(ClienteRuta)
    private clienteRutaRepository: Repository<ClienteRuta>,

    @InjectRepository(Precio)
    private precioRepository: Repository<Precio>,

    @InjectRepository(Direccione)
    private direccionRepository: Repository<Direccione>,

    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
  ) { }

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const { idRepartidor, ...rutaData } = createRutaDto;

    const repartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });

    if (!repartidor) {
      throw new NotFoundException(
        `Usuario repartidor con ID ${idRepartidor} no encontrado`,
      );
    }

    if (repartidor.role !== 'repartidor') {
      throw new BadRequestException(`El usuario no es repartidor`);
    }

    const nuevaRuta = this.rutaRepository.create({
      ...rutaData,
      repartidor: repartidor,
      diasRuta: [],
    });

    return await this.rutaRepository.save(nuevaRuta);
  }

  async findAll(): Promise<Ruta[]> {
    return this.rutaRepository.find({
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
        'diasRuta.clientesRuta.precio'
      ]
    });
  }


  async actualizarRuta(id: number, data: any) {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: ['supervisor', 'repartidor']
    });

    if (!ruta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    // Actualizar nombre
    if (data.nombre) {
      ruta.nombre = data.nombre;
    }

    // Actualizar supervisor
    if (data.idSupervisor !== undefined) {
      if (data.idSupervisor === null) {
        ruta.supervisor = undefined;
        ruta.supervisor_id = undefined;
      } else {
        const supervisor = await this.usuarioRepository.findOne({
          where: { id: data.idSupervisor }
        });
        if (supervisor) {
          ruta.supervisor = supervisor;
          ruta.supervisor_id = data.idSupervisor;
        }
      }
    }

    // Actualizar repartidor
    if (data.idRepartidor !== undefined) {
      if (data.idRepartidor === null) {
        ruta.repartidor = undefined;
        ruta.idRepartidor = undefined;
      } else {
        const repartidor = await this.usuarioRepository.findOne({
          where: { id: data.idRepartidor }
        });
        if (repartidor) {
          ruta.repartidor = repartidor;
          ruta.idRepartidor = data.idRepartidor;
        }
      }
    }

    return await this.rutaRepository.save(ruta);
  }

  async findOne(id: number, options?: any) {
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      ...options
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con id ${id} no encontrada`);
    }

    return ruta;
  }

  async asignarCliente(datos: CreateClienteRutaDto) {
    const { idCliente, diaRutaId, precioId, esCredito, requiereFactura } = datos;

    const diaRuta = await this.diaRutaRepository.findOneBy({ id: diaRutaId });
    if (!diaRuta) throw new NotFoundException(`DiaRuta ${diaRutaId} no encontrada`);

    const cliente = await this.clienteRepository.findOneBy({ id: idCliente });
    if (!cliente) throw new NotFoundException(`Cliente ${idCliente} no encontrado`);

    const precio = await this.precioRepository.findOneBy({ id: precioId });
    if (!precio) throw new NotFoundException(`Precio ${precioId} no encontrado`);

    const existe = await this.clienteRutaRepository.findOne({
      where: {
        cliente: { id: idCliente },
        diaRuta: { id: diaRutaId }
      }
    });

    if (existe) {
      throw new BadRequestException(`El cliente ${cliente.representante} ya está en este día de ruta.`);
    }

    const nuevaAsignacion = this.clienteRutaRepository.create({
      diaRuta: diaRuta,
      cliente: cliente,
      precio: precio,
      es_credito: esCredito || false,
      requiere_factura: requiereFactura || false
    });

    return await this.clienteRutaRepository.save(nuevaAsignacion);
  }

  async removeClienteFromRuta(idDiaRuta: number, idCliente: number) {
    const relacion = await this.clienteRutaRepository.findOne({
      where: {
        diaRuta: { id: idDiaRuta },
        cliente: { id: idCliente }
      }
    });

    if (!relacion) {
      throw new NotFoundException('Ese cliente no pertenece a ese día de ruta');
    }

    return await this.clienteRutaRepository.remove(relacion);
  }

  async importarDesdeExcel(importarDto: ImportarExcelDto) {
    const { fechaReporte, clientes, nombreRuta, supervisorId, repartidorId } = importarDto;

    // 1. BUSCAR SUPERVISOR Y REPARTIDOR (SI VIENEN)
    let supervisorUsuario: Usuario | null = null;
    let repartidorUsuario: Usuario | null = null;

    if (supervisorId) {
      supervisorUsuario = await this.usuarioRepository.findOne({
        where: { id: supervisorId }
      });
    }

    if (repartidorId) {
      repartidorUsuario = await this.usuarioRepository.findOne({
        where: { id: repartidorId }
      });
    }

    // 2. CREAR LA RUTA PADRE CON SUPERVISOR/REPARTIDOR OPCIONALES
    const rutaPadre = this.rutaRepository.create({
      nombre: nombreRuta,
      supervisor: supervisorUsuario || undefined,
      repartidor: repartidorUsuario || undefined,
      diasRuta: []
    });

    const rutaGuardada = await this.rutaRepository.save(rutaPadre);

    // 2. AGRUPAR CLIENTES POR DÍAS
    const clientesPorDia = this.agruparClientesPorDias(clientes);

    // 3. CREAR UN DiaRuta POR CADA GRUPO DE DÍAS
    const diasRutaCreados: Array<{
      diaRuta: DiaRuta;
      clientesImportados: number;
      totalClientes: number;
    }> = [];

    for (const [diasKey, clientesDelDia] of Object.entries(clientesPorDia)) {
      if (clientesDelDia.length === 0) continue;

      // Crear DiaRuta
      const diaRuta = this.diaRutaRepository.create({
        nombre: `${nombreRuta} - ${diasKey}`,
        diaSemana: diasKey as DiasSemana,
        ruta: rutaGuardada,
        ruta_id: rutaGuardada.id
      });

      const diaRutaGuardado = await this.diaRutaRepository.save(diaRuta);

      // 4. PROCESAR CADA CLIENTE DE ESTE DÍA
      const clientesRutaCreados: ClienteRuta[] = [];

      for (const clienteDto of clientesDelDia) {
        try {
          const clienteRutaCreado = await this.procesarClienteExcel(
            clienteDto,
            diaRutaGuardado,
            diasKey
          );
          clientesRutaCreados.push(clienteRutaCreado);
        } catch (error) {
          console.error(`Error procesando cliente ${clienteDto.numeroCliente}:`, error.message);
        }
      }

      diasRutaCreados.push({
        diaRuta: diaRutaGuardado,
        clientesImportados: clientesRutaCreados.length,
        totalClientes: clientesDelDia.length
      });
    }

    return {
      success: true,
      message: `Ruta creada exitosamente`,
      ruta: rutaGuardada,
      diasRutaCreados: diasRutaCreados.length,
      detalles: diasRutaCreados,
      fechaReporte: fechaReporte
    };
  }

  private agruparClientesPorDias(clientes: ClienteExcelDto[]): Record<string, ClienteExcelDto[]> {
    const grupos: Record<string, ClienteExcelDto[]> = {
      'Lunes - Jueves': [],
      'Martes - Viernes': [],
      'Miercoles - Sábado': []
    };

    const diasMap: Record<string, string> = {
      'LJ': 'Lunes - Jueves',
      'LUN': 'Lunes - Jueves',
      'JUE': 'Lunes - Jueves',
      'MV': 'Martes - Viernes',
      'MAR': 'Martes - Viernes',
      'VIE': 'Martes - Viernes',
      'IS': 'Miercoles - Sábado',
      'MIE': 'Miercoles - Sábado',
      'SAB': 'Miercoles - Sábado',
    };

    clientes.forEach(cliente => {
      console.log('🔍 Cliente:', cliente.numeroCliente, 'diasVisita:', cliente.diasVisita);
      const visUpper = cliente.diasVisita.toUpperCase().trim();
      const diaRuta = diasMap[visUpper] || 'Miercoles - Sábado';

      if (grupos[diaRuta]) {
        grupos[diaRuta].push(cliente);
      }
    });

    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => {
        const ordenA = parseInt(a.ordenVisita) || 0;
        const ordenB = parseInt(b.ordenVisita) || 0;
        return ordenA - ordenB;
      });
    });

    return grupos;
  }

  private async procesarClienteExcel(
    clienteDto: ClienteExcelDto,
    diaRuta: DiaRuta,
    diasRuta: string
  ): Promise<ClienteRuta> {

    const cteNumero = parseInt(clienteDto.numeroCliente);

    // 1. BUSCAR CLIENTE EXISTENTE
    let cliente = await this.clienteRepository.findOne({
      where: { cte: cteNumero },
      relations: ['direcciones', 'tipoPrecio']
    });

    // 2. SI NO EXISTE, CREARLO
    if (!cliente) {
      const nombreCliente = clienteDto.nombreNegocio || clienteDto.representante;

      const precioValue = parseFloat(clienteDto.precioGarrafon.replace(/[^0-9.]/g, ''));
      let precio = await this.precioRepository.findOne({
        where: { precioPorGarrafon: precioValue }
      });

      if (!precio) {
        precio = await this.precioRepository.findOne({
          order: { id: 'ASC' }
        });
      }

      cliente = this.clienteRepository.create({
        cte: cteNumero,
        representante: nombreCliente,
        negocio: clienteDto.nombreNegocio || '',
        telefono: '',
        tipoPrecio: precio || undefined,
        direcciones: [],
        clienteRutas: []
      });

      cliente = await this.clienteRepository.save(cliente);
    }

    if (!cliente) {
      throw new BadRequestException('Error al crear/obtener cliente');
    }

    // 3. BUSCAR O CREAR DIRECCIÓN
    let direccion = cliente.direcciones?.find(
      d => d.direccion === clienteDto.direccion && d.colonia === clienteDto.colonia
    );

    if (!direccion) {
      direccion = this.direccionRepository.create({
        direccion: clienteDto.direccion,
        colonia: clienteDto.colonia,
        codigoPostal: 0,
        ciudad: 'Oaxaca',
        latitud: clienteDto.latitud || 17.0732,
        longitud: clienteDto.longitud || -96.7266,
        cliente: cliente,
        clienteId: cliente.id
      });

      direccion = await this.direccionRepository.save(direccion);
    }

    // 4. BUSCAR PRECIO PARA ESTA RUTA
    const precioValue = parseFloat(clienteDto.precioGarrafon.replace(/[^0-9.]/g, ''));
    let precio = await this.precioRepository.findOne({
      where: { precioPorGarrafon: precioValue }
    });

    if (!precio) {
      precio = cliente.tipoPrecio || await this.precioRepository.findOne({
        order: { id: 'ASC' }
      });
    }

    if (!precio) {
      throw new BadRequestException(
        `No se encontró precio para cliente ${clienteDto.numeroCliente}`
      );
    }

    // 5. VERIFICAR SI YA EXISTE EN ESTE DÍA DE RUTA
    const yaExiste = await this.clienteRutaRepository.findOne({
      where: {
        cliente: { id: cliente.id },
        diaRuta: { id: diaRuta.id }
      }
    });

    if (yaExiste) {
      return yaExiste;
    }

    const esCredito = clienteDto.esCredito || false;
    const requiereFactura = clienteDto.requiereFactura || false;

    const clienteRuta = this.clienteRutaRepository.create({
      cliente: cliente,
      diaRuta: diaRuta,
      precio: precio,
      es_credito: esCredito,
      requiere_factura: requiereFactura
    });

    return await this.clienteRutaRepository.save(clienteRuta);
  }

  /**
   * OBTENER RUTAS AGRUPADAS POR ESTADO
   */
  async getRutasPorEstado(estado?: string) {
    const query = this.rutaRepository
      .createQueryBuilder('ruta')
      .leftJoinAndSelect('ruta.supervisor', 'supervisor')
      .leftJoinAndSelect('ruta.repartidor', 'repartidor')
      .leftJoinAndSelect('ruta.diasRuta', 'diasRuta')
      .leftJoinAndSelect('diasRuta.clientesRuta', 'clientesRuta');

    if (estado) {
      query.where('diasRuta.estado = :estado', { estado });
    }

    return query.getMany();
  }

  /**
   * OBTENER DÍAS DE RUTA POR ESTADO
   */
  async getDiasRutaPorEstado(estado: string) {
    return this.diaRutaRepository.find({
      where: { estado: estado as any },
      relations: [
        'ruta',
        'ruta.supervisor',
        'ruta.repartidor',
        'clientesRuta',
        'clientesRuta.cliente'
      ]
    });
  }

  /**
   * ASIGNAR PERSONAL A UNA RUTA
   */
  async asignarPersonalARuta(
    rutaId: number,
    dto: { supervisorId?: number; repartidorId?: number }
  ) {
    const ruta = await this.rutaRepository.findOne({ where: { id: rutaId } });

    if (!ruta) {
      throw new NotFoundException(`Ruta ${rutaId} no encontrada`);
    }

    if (dto.supervisorId) {
      const supervisor = await this.usuarioRepository.findOne({
        where: { id: dto.supervisorId }
      });
      if (supervisor) {
        ruta.supervisor = supervisor;
        ruta.supervisor_id = dto.supervisorId;
      }
    }

    if (dto.repartidorId) {
      const repartidor = await this.usuarioRepository.findOne({
        where: { id: dto.repartidorId }
      });
      if (repartidor) {
        ruta.repartidor = repartidor;
        ruta.idRepartidor = dto.repartidorId;
      }
    }

    await this.rutaRepository.save(ruta);

    return {
      success: true,
      message: 'Personal asignado correctamente',
      ruta
    };
  }

  /**
   * ELIMINAR RUTA CON TODO Y CLIENTES
   * 
   * Este método elimina:
   * 1. Todos los ClienteRuta asociados a cada DiaRuta
   * 2. Todos los DiaRuta de la Ruta
   * 3. La Ruta principal
   */
  async remove(id: number) {
    // 1. Buscar la ruta con todas sus relaciones
    const ruta = await this.rutaRepository.findOne({
      where: { id },
      relations: [
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.ventas'  // ← IMPORTANTE: Cargar ventas también
      ]
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta ${id} no encontrada`);
    }

    // 2. Contadores para el reporte
    let totalVentasEliminadas = 0;
    let totalClientesEliminados = 0;
    let totalDiasEliminados = 0;

    // 3. Eliminar en cascada manualmente (para tener control total)
    for (const diaRuta of ruta.diasRuta) {
      if (diaRuta.clientesRuta && diaRuta.clientesRuta.length > 0) {

        for (const clienteRuta of diaRuta.clientesRuta) {
          // 3.1 Eliminar todas las ventas de este ClienteRuta
          if (clienteRuta.ventas && clienteRuta.ventas.length > 0) {
            await this.ventaRepository.remove(clienteRuta.ventas);
            totalVentasEliminadas += clienteRuta.ventas.length;
          }
        }

        // 3.2 Eliminar todos los ClienteRuta de este DiaRuta
        await this.clienteRutaRepository.remove(diaRuta.clientesRuta);
        totalClientesEliminados += diaRuta.clientesRuta.length;
      }

      // 3.3 Eliminar el DiaRuta
      await this.diaRutaRepository.remove(diaRuta);
      totalDiasEliminados++;
    }

    // 4. Eliminar la Ruta principal
    await this.rutaRepository.remove(ruta);

    return {
      success: true,
      message: 'Ruta eliminada correctamente',
      detalles: {
        rutaId: id,
        rutaNombre: ruta.nombre,
        diasEliminados: totalDiasEliminados,
        clientesEliminados: totalClientesEliminados,
        ventasEliminadas: totalVentasEliminadas
      }
    };
  }

  /**
   * CAMBIAR ESTADO DE UN DÍA DE RUTA
   */
  async cambiarEstadoDiaRuta(diaRutaId: number, nuevoEstado: string) {
    const diaRuta = await this.diaRutaRepository.findOne({
      where: { id: diaRutaId }
    });

    if (!diaRuta) {
      throw new NotFoundException(`DiaRuta ${diaRutaId} no encontrado`);
    }

    diaRuta.estado = nuevoEstado as any;

    // Si cambia a EN_CURSO, registrar fecha de inicio
    if (nuevoEstado === 'en_curso' && !diaRuta.fechaInicio) {
      diaRuta.fechaInicio = new Date();
    }

    // Si cambia a COMPLETADA, registrar fecha de finalización
    if (nuevoEstado === 'completada' && !diaRuta.fechaFinalizacion) {
      diaRuta.fechaFinalizacion = new Date();
    }

    await this.diaRutaRepository.save(diaRuta);

    return {
      success: true,
      message: 'Estado actualizado',
      diaRuta
    };
  }


  /**
   * Crear una nueva ruta con su primer día de ruta
   */
  async crearRutaConDia(data: {
    nombre: string;
    supervisorId: number | null;
    repartidorId: number | null;
    diaSemana: string;
    clientesIds: number[];
  }) {
    const { nombre, supervisorId, repartidorId, diaSemana, clientesIds } = data;

    let supervisor: Usuario | null = null;
    let repartidor: Usuario | null = null;

    if (supervisorId) {
      supervisor = await this.usuarioRepository.findOne({
        where: { id: supervisorId }
      });
    }

    if (repartidorId) {
      repartidor = await this.usuarioRepository.findOne({
        where: { id: repartidorId }
      });
    }

    const nuevaRuta = this.rutaRepository.create({
      nombre: nombre.toUpperCase(),
      supervisor: supervisor || undefined,
      repartidor: repartidor || undefined,
      diasRuta: []
    });

    const rutaGuardada = await this.rutaRepository.save(nuevaRuta);

    const diaRuta = this.diaRutaRepository.create({
      nombre: `${nombre} - ${diaSemana}`,
      diaSemana: diaSemana as any,
      ruta: rutaGuardada,
      ruta_id: rutaGuardada.id
    });

    const diaRutaGuardado = await this.diaRutaRepository.save(diaRuta);

    const clientesAsignados: ClienteRuta[] = [];

    for (const clienteId of clientesIds) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: clienteId },
        relations: ['tipoPrecio']
      });

      if (!cliente) continue;

      const clienteRuta = this.clienteRutaRepository.create({
        cliente: cliente,
        diaRuta: diaRutaGuardado,
        precio: cliente.tipoPrecio || undefined,
        es_credito: false,
        requiere_factura: false
      });

      const clienteRutaGuardado = await this.clienteRutaRepository.save(clienteRuta);
      clientesAsignados.push(clienteRutaGuardado);
    }

    return {
      success: true,
      message: 'Ruta creada con día de visita y clientes',
      ruta: rutaGuardada,
      diaRuta: diaRutaGuardado,
      clientesAsignados: clientesAsignados.length
    };
  }

  /**
   * Agregar un día de ruta a una ruta existente
   */
  async agregarDiaARuta(data: {
    rutaId: number;
    diaSemana: string;
    clientesIds: number[];
  }) {
    const { rutaId, diaSemana, clientesIds } = data;

    const ruta = await this.rutaRepository.findOne({
      where: { id: rutaId },
      relations: ['diasRuta']
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta ${rutaId} no encontrada`);
    }

    const diaExistente = ruta.diasRuta?.find(
      dr => dr.diaSemana === diaSemana
    );

    if (diaExistente) {
      throw new BadRequestException(
        `La ruta "${ruta.nombre}" ya tiene el día ${diaSemana}`
      );
    }

    const diaRuta = this.diaRutaRepository.create({
      nombre: `${ruta.nombre} - ${diaSemana}`,
      diaSemana: diaSemana as any,
      ruta: ruta,
      ruta_id: rutaId
    });

    const diaRutaGuardado = await this.diaRutaRepository.save(diaRuta);

    const clientesAsignados: ClienteRuta[] = [];

    for (const clienteId of clientesIds) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: clienteId },
        relations: ['tipoPrecio']
      });

      if (!cliente) continue;

      const clienteRuta = this.clienteRutaRepository.create({
        cliente: cliente,
        diaRuta: diaRutaGuardado,
        precio: cliente.tipoPrecio || undefined,
        es_credito: false,
        requiere_factura: false
      });

      const clienteRutaGuardado = await this.clienteRutaRepository.save(clienteRuta);
      clientesAsignados.push(clienteRutaGuardado);
    }

    return {
      success: true,
      message: `Día de ruta ${diaSemana} agregado con ${clientesAsignados.length} clientes`,
      diaRuta: diaRutaGuardado,
      clientesAsignados: clientesAsignados.length
    };
  }


  async obtenerClientesDisponibles(diaRutaId?: number) {
    if (diaRutaId) {
      const clientesEnEseDia = await this.clienteRutaRepository
        .createQueryBuilder('cr')
        .select('cr.cliente_id')
        .where('cr.dia_ruta_id = :diaRutaId', { diaRutaId })
        .getRawMany();

      const idsExcluir = clientesEnEseDia.map(c => c.cliente_id);

      if (idsExcluir.length > 0) {
        return this.clienteRepository.find({
          where: { id: Not(In(idsExcluir)) },
          relations: ['direcciones', 'tipoPrecio'],
          order: { representante: 'ASC' }
        });
      }

      return this.clienteRepository.find({
        relations: ['direcciones', 'tipoPrecio'],
        order: { representante: 'ASC' }
      });
    } else {
      const clientesConRuta = await this.clienteRutaRepository
        .createQueryBuilder('clienteRuta')
        .select('DISTINCT clienteRuta.cliente_id')
        .getRawMany();

      const idsConRuta = clientesConRuta.map(cr => cr.cliente_id);

      if (idsConRuta.length > 0) {
        return this.clienteRepository.find({
          where: { id: Not(In(idsConRuta)) },
          relations: ['direcciones', 'tipoPrecio'],
          order: { representante: 'ASC' }
        });
      }

      return this.clienteRepository.find({
        relations: ['direcciones', 'tipoPrecio'],
        order: { representante: 'ASC' }
      });
    }
  }

  // ⭐ MÉTODOS PARA REPARTIDOR (SIN TOCAR CLIENTE-RUTA)

  /**
   * Obtener rutas asignadas a un repartidor
   */
  async obtenerRutasRepartidor(repartidorId: number) {
    return this.rutaRepository.find({
      where: { repartidor: { id: repartidorId } },
      relations: [
        'supervisor',
        'repartidor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
        'diasRuta.clientesRuta.cliente.direcciones',
        'diasRuta.clientesRuta.precio'
      ]
    });
  }

  /**
   * Iniciar un día de ruta (cambiar estado a en_curso)
   */
  async iniciarDiaRuta(diaRutaId: number) {
    const diaRuta = await this.diaRutaRepository.findOne({
      where: { id: diaRutaId }
    });

    if (!diaRuta) {
      throw new NotFoundException('DiaRuta no encontrado');
    }

    diaRuta.estado = EstadoDiaRuta.EN_CURSO;

    if (!diaRuta.fechaInicio) {
      diaRuta.fechaInicio = new Date();
    }

    return this.diaRutaRepository.save(diaRuta);
  }



}