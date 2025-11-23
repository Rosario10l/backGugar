import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
import { DiasSemana } from './entities/dia-ruta.entity';

@Injectable()
export class RutasService {

  constructor(
    @InjectRepository(DiaRuta)
    private diaRutaRepository: Repository<DiaRuta>,

    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>,

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
  ) { }

  async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
    const { idRepartidor, ...rutaData } = createRutaDto;

    const repartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });

    if (!repartidor) {
      throw new NotFoundException(`Usuario repartidor con ID ${idRepartidor} no encontrado`);
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
        'diasRuta.clientesRuta', // ← CORREGIDO
        'diasRuta.clientesRuta.cliente', // ← CORREGIDO
        'diasRuta.clientesRuta.precio' // ← CORREGIDO
      ]
    });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id: id },
      relations: [
        'repartidor',
        'supervisor',
        'diasRuta',
        'diasRuta.clientesRuta', // ← CORREGIDO
        'diasRuta.clientesRuta.cliente', // ← CORREGIDO
        'diasRuta.clientesRuta.precio' // ← CORREGIDO
      ],
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
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

      // Crear DiaRuta - CORRECCIÓN: usar el objeto correcto
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
            diaRutaGuardado, // ← CORREGIDO: pasar el objeto guardado, no array
            diasKey
          );
          clientesRutaCreados.push(clienteRutaCreado);
        } catch (error) {
          console.error(`Error procesando cliente ${clienteDto.numeroCliente}:`, error.message);
        }
      }

      diasRutaCreados.push({
        diaRuta: diaRutaGuardado, // ← CORREGIDO: objeto individual
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

      //  const diaRuta = cliente.diasVisita;

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
    diaRuta: DiaRuta, // ← Tipo correcto
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

async remove(id: number) {
  const ruta = await this.rutaRepository.findOne({ 
    where: { id },
    relations: ['diasRuta', 'diasRuta.clientesRuta']
  });

  if (!ruta) {
    throw new NotFoundException(`Ruta ${id} no encontrada`);
  }

  await this.rutaRepository.remove(ruta);

  return {
    success: true,
    message: 'Ruta eliminada correctamente'
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

}