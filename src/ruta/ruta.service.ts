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
import { DiasSemana } from './entities/dia-ruta.entity'; // ← MOVER ENUM A dia-ruta.entity

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
        'diasRuta.clienteRutas',
        'diasRuta.clienteRutas.cliente',
        'diasRuta.clienteRutas.precio'
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
        'diasRuta.clienteRutas',
        'diasRuta.clienteRutas.cliente',
        'diasRuta.clienteRutas.precio'
      ],
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return ruta;
  }

  async asignarCliente(datos: CreateClienteRutaDto) {
    const { idCliente, diaRutaId, precioId, esCredito, requiereFactura } = datos; // ← CAMBIAR rutaId por diaRutaId

    // ← CAMBIAR: Buscar DiaRuta en lugar de Ruta
    const diaRuta = await this.diaRutaRepository.findOneBy({ id: diaRutaId });
    if (!diaRuta) throw new NotFoundException(`DiaRuta ${diaRutaId} no encontrada`);

    const cliente = await this.clienteRepository.findOneBy({ id: idCliente });
    if (!cliente) throw new NotFoundException(`Cliente ${idCliente} no encontrado`);

    const precio = await this.precioRepository.findOneBy({ id: precioId });
    if (!precio) throw new NotFoundException(`Precio ${precioId} no encontrado`);

    // ← CAMBIAR: Verificar si ya existe en este DiaRuta
    const existe = await this.clienteRutaRepository.findOne({
      where: {
        cliente: { id: idCliente },
        diaRuta: { id: diaRutaId } // ← CAMBIO
      }
    });

    if (existe) {
      throw new BadRequestException(`El cliente ${cliente.representante} ya está en este día de ruta.`);
    }

    const nuevaAsignacion = this.clienteRutaRepository.create({
      diaRuta: diaRuta, // ← CAMBIO
      cliente: cliente,
      precio: precio,
      esCredito: esCredito || false,
      requiereFactura: requiereFactura || false
    });

    return await this.clienteRutaRepository.save(nuevaAsignacion);
  }

  async removeClienteFromRuta(idDiaRuta: number, idCliente: number) { // ← CAMBIAR nombre del parámetro
    const relacion = await this.clienteRutaRepository.findOne({
      where: {
        diaRuta: { id: idDiaRuta }, // ← CAMBIO
        cliente: { id: idCliente }
      }
    });

    if (!relacion) {
      throw new NotFoundException('Ese cliente no pertenece a ese día de ruta');
    }

    return await this.clienteRutaRepository.remove(relacion);
  }

  async importarDesdeExcel(importarDto: ImportarExcelDto) {
    const { supervisor, fechaReporte, clientes, nombreRuta } = importarDto; // ← QUITAR lugarEntrega

    // 1. BUSCAR SUPERVISOR
    let supervisorUsuario = await this.usuarioRepository.findOne({
      where: { name: supervisor }
    });

    if (!supervisorUsuario) {
      throw new NotFoundException(
        `Supervisor/Repartidor "${supervisor}" no encontrado en la base de datos. Por favor créalo primero.`
      );
    }

    if (supervisorUsuario.role !== 'repartidor') {
      throw new BadRequestException(`El usuario "${supervisor}" no tiene rol de repartidor`);
    }

    // 2. CREAR LA RUTA PADRE (UNA SOLA VEZ)
    const rutaPadre = this.rutaRepository.create({
      nombre: nombreRuta,
      supervisor: supervisorUsuario, // ← Asignar supervisor
      repartidor: supervisorUsuario, // ← Por ahora, el mismo usuario es repartidor también
      diasRuta: []
    });

    const rutaGuardada = await this.rutaRepository.save(rutaPadre);

    // 3. AGRUPAR CLIENTES POR DÍAS
    const clientesPorDia = this.agruparClientesPorDias(clientes);

    // 4. CREAR UN DiaRuta POR CADA GRUPO DE DÍAS
    const diasRutaCreados: Array<{
      diaRuta: DiaRuta;
      clientesImportados: number;
      totalClientes: number;
    }> = [];

    for (const [diasKey, clientesDelDia] of Object.entries(clientesPorDia)) {
      if (clientesDelDia.length === 0) continue; // ← Saltar si no hay clientes

      // Crear DiaRuta
      const diaRuta = this.diaRutaRepository.create({
        nombre: `${nombreRuta} - ${diasKey}`,
        diaSemana: diasKey as DiasSemana,
        ruta: rutaGuardada,
        clienteRutas: []
      });

      const diaRutaGuardado = await this.diaRutaRepository.save(diaRuta);

      // 5. PROCESAR CADA CLIENTE DE ESTE DÍA
      const clientesRutaCreados: ClienteRuta[] = [];

      for (const clienteDto of clientesDelDia) {
        try {
          const clienteRutaCreado = await this.procesarClienteExcel(
            clienteDto,
            diaRutaGuardado, // ← Ahora pasamos DiaRuta
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
      supervisor: supervisor,
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
      'DOM': 'Miercoles - Sábado'
    };

    clientes.forEach(cliente => {
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
    diaRuta: DiaRuta, // ← CAMBIO: recibir DiaRuta
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
        diaRuta: { id: diaRuta.id } // ← CAMBIO
      }
    });

    if (yaExiste) {
      return yaExiste;
    }

    const esCredito = clienteDto.esCredito || false;
    const requiereFactura = clienteDto.requiereFactura || false;

    const clienteRuta = this.clienteRutaRepository.create({
      cliente: cliente,
      diaRuta: diaRuta, // ← CAMBIO
      precio: precio,
      esCredito: esCredito,
      requiereFactura: requiereFactura
    });

    return await this.clienteRutaRepository.save(clienteRuta);
  }
}