import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Precio } from 'src/precios/entities/precio.entity';
import { ClienteConRutaDto, ClientesAgrupadosResponseDto, RutaConClientesDto } from './dto/clientes-agrupados.dto';
import { DiaRuta } from 'src/ruta/entities/dia-ruta.entity';
import { ClienteRuta } from 'src/ruta/entities/cliente-ruta.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
    @InjectRepository(Precio)
    private precioRepo: Repository<Precio>,
    @InjectRepository(DiaRuta)
    private diaRutaRepository: Repository<DiaRuta>,
    @InjectRepository(ClienteRuta)
    private clienteRutaRepository: Repository<ClienteRuta>,
  ) { }

  async createCliente(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const { tipoPrecioId, diaRutaId, ...datosCliente } = createClienteDto;

    // Buscar el precio
    const precio = await this.precioRepo.findOneBy({ id: tipoPrecioId });
    if (!precio) {
      throw new NotFoundException(`Precio con ID ${tipoPrecioId} no encontrado`);
    }

    // Verificar que el CTE no esté duplicado
    if (datosCliente.cte) {
      const cteExistente = await this.clienteRepo.findOne({
        where: { cte: datosCliente.cte }
      });
      if (cteExistente) {
        throw new BadRequestException(`Ya existe un cliente con el número CTE ${datosCliente.cte}`);
      }
    }

    // Crear el cliente
    const nuevoCliente = this.clienteRepo.create({
      ...datosCliente,
      tipoPrecio: precio,
    });

    const clienteGuardado = await this.clienteRepo.save(nuevoCliente);

    // Si se proporcionó diaRutaId, asignar a la ruta
    if (diaRutaId) {
      const diaRuta = await this.diaRutaRepository.findOne({
        where: { id: diaRutaId }
      });

      if (diaRuta) {
        const clienteRuta = this.clienteRutaRepository.create({
          cliente: clienteGuardado,
          diaRuta: diaRuta,
          precio: precio,
          es_credito: false,
          requiere_factura: false,
          visitado: false,
        });
        await this.clienteRutaRepository.save(clienteRuta);
      }
    }

    return clienteGuardado;
  }
  async findAll() {
    return this.clienteRepo.find({ relations: ['tipoPrecio'] });
  }

  async findOne(id: number) {
    return this.clienteRepo.findOne({
      where: { id },
      relations: ['tipoPrecio'],
    });
  }

  async updateCliente(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = await this.clienteRepo.findOneBy({ id });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      // Validar Precio si viene en el DTO
      if (updateClienteDto.tipoPrecioId) {
        const precio = await this.precioRepo.findOneBy({
          id: updateClienteDto.tipoPrecioId,
        });
        if (!precio) throw new BadRequestException('Precio no encontrado');
        // Asignamos el objeto precio a la entidad
        cliente.tipoPrecio = precio;
      }

      // Fusionamos los demás datos (calle, colonia, latitud, etc.)
      // El 'merge' toma todo lo que venga en el DTO y lo pone en el cliente
      this.clienteRepo.merge(cliente, updateClienteDto);

      return await this.clienteRepo.save(cliente);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async removeCliente(id: number) {
    try {
      const cliente = await this.clienteRepo.findOneBy({ id });
      if (!cliente) {
        throw new NotFoundException(`cliente con el id: ${id} no encontrado`);
      }
      await this.clienteRepo.remove(cliente);
      return { message: `cliente con el id: ${id} se ha eliminado` };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }


  async obtenerRutasDeSupervisor(supervisorId: number): Promise<ClientesAgrupadosResponseDto> {
    // 1. Obtener todas las rutas del supervisor
    const rutas = await this.clienteRepo
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.clienteRutas', 'clienteRutas')
      .leftJoinAndSelect('clienteRutas.diaRuta', 'diaRuta')
      .leftJoinAndSelect('diaRuta.ruta', 'ruta')
      .leftJoinAndSelect('ruta.supervisor', 'supervisor')
      .leftJoinAndSelect('ruta.repartidor', 'repartidor')
      .leftJoinAndSelect('cliente.tipoPrecio', 'tipoPrecio')
      .where('supervisor.id = :supervisorId', { supervisorId })
      .getMany();

    const rutasMap = new Map<number, RutaConClientesDto>();

    // 2. Procesar clientes y agrupar por ruta
    for (const cliente of rutas) {
      if (!cliente.clienteRutas || cliente.clienteRutas.length === 0) continue;

      for (const clienteRuta of cliente.clienteRutas) {
        if (!clienteRuta.diaRuta || !clienteRuta.diaRuta.ruta) continue;

        const ruta = clienteRuta.diaRuta.ruta;

        // Filtrar solo rutas de este supervisor
        if (!ruta.supervisor || ruta.supervisor.id !== supervisorId) continue;

        const diaRuta = clienteRuta.diaRuta;

        // Crear estructura de ruta si no existe
        if (!rutasMap.has(ruta.id)) {
          rutasMap.set(ruta.id, {
            id: ruta.id,
            nombre: ruta.nombre,
            numeroRuta: `R-${ruta.id}`,
            repartidor: ruta.repartidor ? {
              id: ruta.repartidor.id,
              nombre: ruta.repartidor.name,
            } : null,
            supervisor: ruta.supervisor ? {
              id: ruta.supervisor.id,
              nombre: ruta.supervisor.name,
            } : null,
            diasRuta: [],
            totalClientes: 0,
          });
        }

        const rutaActual = rutasMap.get(ruta.id)!;

        // Buscar o crear día de ruta
        let diaRutaActual = rutaActual.diasRuta.find(d => d.id === diaRuta.id);
        if (!diaRutaActual) {
          diaRutaActual = {
            id: diaRuta.id,
            diaSemana: diaRuta.diaSemana,
            cantidadClientes: 0,
            clientes: [],
          };
          rutaActual.diasRuta.push(diaRutaActual);
        }

        // Agregar cliente al día
        diaRutaActual.clientes.push({
          id: cliente.id,
          nombre: cliente.nombre,
          negocio: cliente.negocio,
          telefono: cliente.telefono,
          cte: cliente.cte,
          correo: cliente.correo,
          calle: cliente.calle,
          colonia: cliente.colonia,
          referencia: cliente.referencia,
          latitud: cliente.latitud,
          longitud: cliente.longitud,
          tipoPrecio: cliente.tipoPrecio ? {
            id: cliente.tipoPrecio.id,
            tipoCompra: cliente.tipoPrecio.tipoCompra,
            precioPorGarrafon: parseFloat(cliente.tipoPrecio.precioPorGarrafon.toString()),
          } : null,
          ruta: {
            id: ruta.id,
            nombre: ruta.nombre,
            numeroRuta: `R-${ruta.id}`,
          },
          diaRuta: {
            id: diaRuta.id,
            diaSemana: diaRuta.diaSemana,
          },
        });

        diaRutaActual.cantidadClientes++;
        rutaActual.totalClientes++;
      }
    }

    // 3. Convertir Map a Array y ordenar
    const asignados = Array.from(rutasMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    // Ordenar días dentro de cada ruta
    const ordenDias = ['Lunes-Jueves', 'Martes-Viernes', 'Miércoles-Sábado'];
    for (const ruta of asignados) {
      ruta.diasRuta.sort((a, b) => {
        const indexA = ordenDias.indexOf(a.diaSemana);
        const indexB = ordenDias.indexOf(b.diaSemana);
        return indexA - indexB;
      });
    }

    return {
      asignados,
      noAsignados: [], // El supervisor no ve clientes no asignados
      totalAsignados: asignados.reduce((sum, r) => sum + r.totalClientes, 0),
      totalNoAsignados: 0,
    };
  }


  // FUNCIÓN VER PEDIDOS DEL CLIENTE
  async verPedidos(clienteId: number) {
    const cliente = await this.clienteRepo.findOne({
      where: { id: clienteId },
      relations: ['pedidos'] // Esto carga los pedidos relacionados
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    return cliente.pedidos;
  }


  async obtenerClientesAgrupados(): Promise<ClientesAgrupadosResponseDto> {
    // 1. Obtener todos los clientes con sus relaciones
    const todosLosClientes = await this.clienteRepo.find({
      relations: [
        'tipoPrecio',
        'clienteRutas',
        'clienteRutas.diaRuta',
        'clienteRutas.diaRuta.ruta',
        'clienteRutas.diaRuta.ruta.repartidor',
        'clienteRutas.diaRuta.ruta.supervisor',
      ],
    });

    const noAsignados: ClienteConRutaDto[] = [];
    const rutasMap = new Map<number, RutaConClientesDto>();

    // 2. Procesar cada cliente
    for (const cliente of todosLosClientes) {
      // ⭐ VALIDACIÓN CRÍTICA: Asegurar que el cliente tenga ID válido
      if (!cliente.id || isNaN(cliente.id)) {
        console.warn('Cliente con ID inválido encontrado, omitiendo:', cliente);
        continue;
      }

      // Si no tiene relaciones con rutas, va a "No asignados"
      if (!cliente.clienteRutas || cliente.clienteRutas.length === 0) {
        noAsignados.push({
          id: cliente.id,
          nombre: cliente.nombre || '',
          negocio: cliente.negocio || null,
          telefono: cliente.telefono || '',
          correo: cliente.correo || null,
          cte: cliente.cte || 0,
          calle: cliente.calle || '',
          colonia: cliente.colonia || '',
          referencia: cliente.referencia || '',
          latitud: cliente.latitud || null,
          longitud: cliente.longitud || null,
          tipoPrecio: cliente.tipoPrecio ? {
            id: cliente.tipoPrecio.id,
            tipoCompra: cliente.tipoPrecio.tipoCompra,
            precioPorGarrafon: parseFloat(cliente.tipoPrecio.precioPorGarrafon.toString()),
          } : null,
          ruta: null,
          diaRuta: null,
        });
        continue;
      }

      // 3. Procesar clientes asignados a rutas
      for (const clienteRuta of cliente.clienteRutas) {
        if (!clienteRuta.diaRuta || !clienteRuta.diaRuta.ruta) continue;

        const ruta = clienteRuta.diaRuta.ruta;
        const diaRuta = clienteRuta.diaRuta;

        // ⭐ VALIDACIÓN: Asegurar que la ruta tenga ID válido
        if (!ruta.id || isNaN(ruta.id)) {
          console.warn('Ruta con ID inválido encontrada, omitiendo:', ruta);
          continue;
        }

        // Crear estructura de ruta si no existe
        if (!rutasMap.has(ruta.id)) {
          rutasMap.set(ruta.id, {
            id: ruta.id,
            nombre: ruta.nombre || 'Sin nombre',
            numeroRuta: `R-${ruta.id}`,
            repartidor: ruta.repartidor ? {
              id: ruta.repartidor.id,
              nombre: ruta.repartidor.name,
            } : null,
            supervisor: ruta.supervisor ? {
              id: ruta.supervisor.id,
              nombre: ruta.supervisor.name,
            } : null,
            diasRuta: [],
            totalClientes: 0,
          });
        }

        const rutaActual = rutasMap.get(ruta.id)!;

        // Buscar o crear día de ruta
        let diaRutaActual = rutaActual.diasRuta.find(d => d.id === diaRuta.id);
        if (!diaRutaActual) {
          diaRutaActual = {
            id: diaRuta.id,
            diaSemana: diaRuta.diaSemana || 'Sin día',
            cantidadClientes: 0,
            clientes: [],
          };
          rutaActual.diasRuta.push(diaRutaActual);
        }

        // Agregar cliente al día
        diaRutaActual.clientes.push({
          id: cliente.id,
          nombre: cliente.nombre || '',
          negocio: cliente.negocio || null,
          telefono: cliente.telefono || '',
          correo: cliente.correo || null,
          cte: cliente.cte || 0,
          calle: cliente.calle || '',
          colonia: cliente.colonia || '',
          referencia: cliente.referencia || '',
          latitud: cliente.latitud || null,
          longitud: cliente.longitud || null,
          tipoPrecio: cliente.tipoPrecio ? {
            id: cliente.tipoPrecio.id,
            tipoCompra: cliente.tipoPrecio.tipoCompra,
            precioPorGarrafon: parseFloat(cliente.tipoPrecio.precioPorGarrafon.toString()),
          } : null,
          ruta: {
            id: ruta.id,
            nombre: ruta.nombre || 'Sin nombre',
            numeroRuta: `R-${ruta.id}`,
          },
          diaRuta: {
            id: diaRuta.id,
            diaSemana: diaRuta.diaSemana || 'Sin día',
          },
        });

        diaRutaActual.cantidadClientes++;
        rutaActual.totalClientes++;
      }
    }

    // 4. Convertir Map a Array y ordenar
    const asignados = Array.from(rutasMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    // Ordenar días dentro de cada ruta
    const ordenDias = ['Lunes-Jueves', 'Martes-Viernes', 'Miércoles-Sábado'];
    for (const ruta of asignados) {
      ruta.diasRuta.sort((a, b) => {
        const indexA = ordenDias.indexOf(a.diaSemana);
        const indexB = ordenDias.indexOf(b.diaSemana);
        return indexA - indexB;
      });
    }

    return {
      asignados,
      noAsignados,
      totalAsignados: asignados.reduce((sum, r) => sum + r.totalClientes, 0),
      totalNoAsignados: noAsignados.length,
    };
  }

}
