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
import { DividirRutaDto } from './dto/dividir-ruta.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RutasService {
  private GOOGLE_API_KEY: string;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Ruta) private rutaRepository: Repository<Ruta>,
    @InjectRepository(DiaRuta) private diaRutaRepository: Repository<DiaRuta>,
    @InjectRepository(Cliente) private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(ClienteRuta) private clienteRutaRepository: Repository<ClienteRuta>,
    @InjectRepository(Precio) private precioRepository: Repository<Precio>,
  ) {
    this.GOOGLE_API_KEY = this.configService.get<string>('GOOGLE_API_KEY')!;

    if (!this.GOOGLE_API_KEY) {
      throw new Error('La GOOGLE_API_KEY no está configurada correctamente.');
    }
  }

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

    // 1. Cargar la ruta existente
    const ruta = await this.findOne(id);

    // 2. Desestructurar el DTO para separar los IDs de las propiedades que se fusionarán
    const { idRepartidor, idSupervisor, ...rest } = updateRutaDto; // 💡 Obtener idSupervisor

    // --- Lógica para Repartidor ---
    if (idRepartidor) {
      // Asumiendo que ruta.repartidor es de tipo Usuario
      const nuevoRepartidor = await this.usuarioRepository.findOneBy({
        id: idRepartidor,
      });
      if (nuevoRepartidor) ruta.repartidor = nuevoRepartidor;
    }

    // --- Lógica para Supervisor (NUEVO) ---
    if (idSupervisor) { // 💡 Si el DTO incluye un idSupervisor
      // Asumiendo que ruta.supervisor es de tipo Usuario
      const nuevoSupervisor = await this.usuarioRepository.findOneBy({
        id: idSupervisor,
      });
      if (nuevoSupervisor) ruta.supervisor = nuevoSupervisor;
    }

    // 3. Fusionar el resto de las propiedades (nombre, etc.)
    this.rutaRepository.merge(ruta, rest);

    // 4. Guardar los cambios
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



  // ========================================
  // 🆕 MÉTODO 1: CALCULAR SIN GUARDAR (Preview)
  // ========================================
  async calcularDivisionRuta(dividirRutaDto: DividirRutaDto) {
    const { diaRutaId, puntoCorte } = dividirRutaDto;

    // 1. Obtener el día de ruta original
    const diaRutaOriginal = await this.diaRutaRepository.findOne({
      where: { id: diaRutaId },
      relations: ['clientesRuta', 'clientesRuta.cliente', 'clientesRuta.precio', 'ruta'],
    });

    if (!diaRutaOriginal) {
      throw new NotFoundException(`Día de ruta con ID ${diaRutaId} no encontrado`);
    }

    // Validaciones
    if (diaRutaOriginal.dividida) {
      throw new BadRequestException('Esta ruta ya fue dividida previamente.');
    }

    if (diaRutaOriginal.estado === EstadoDiaRuta.EN_CURSO ||
      diaRutaOriginal.estado === EstadoDiaRuta.COMPLETADA) {
      throw new BadRequestException(
        'No se puede dividir una ruta que está en curso o ya fue completada.'
      );
    }

    const clientesConUbicacion = diaRutaOriginal.clientesRuta.filter(
      cr => cr.cliente.latitud && cr.cliente.longitud
    );

    if (clientesConUbicacion.length < 4) {
      throw new BadRequestException(
        'Se necesitan al menos 4 clientes con ubicación GPS para dividir la ruta.'
      );
    }

    const totalClientesConUbicacion = clientesConUbicacion.length;
    if (puntoCorte < 2 || puntoCorte > totalClientesConUbicacion - 2) {
      throw new BadRequestException(
        `El punto de corte debe estar entre 2 y ${totalClientesConUbicacion - 2}`
      );
    }

    // 2. Ordenar clientes
    let clientesParaOrdenacion = clientesConUbicacion.map(cr => ({
      id: cr.cliente.id,
      latitud: cr.cliente.latitud!,
      longitud: cr.cliente.longitud!,
      clienteRuta: cr,
    }));

    const clientesOrdenados = this.ordenarPorVecinoMasCercano(clientesParaOrdenacion);

    // 3. Dividir en dos grupos
    const grupoA_datos = clientesOrdenados.slice(0, puntoCorte);
    const grupoB_datos = clientesOrdenados.slice(puntoCorte);

    const grupoA = grupoA_datos.map(d => d.clienteRuta);
    const grupoB = grupoB_datos.map(d => d.clienteRuta);

    // 4. Calcular rutas optimizadas
    const rutaA = await this.calcularRutaOptimizada(grupoA);
    const rutaB = await this.calcularRutaOptimizada(grupoB);

    // ========================================
    // 🆕 SOLO RETORNAR CÁLCULOS - NO GUARDAR
    // ========================================
    return {
      mensaje: 'Vista previa de la división calculada (no guardada aún)',
      rutaOriginal: {
        id: diaRutaOriginal.id,
        nombre: diaRutaOriginal.ruta.nombre,
        diaSemana: diaRutaOriginal.diaSemana,
        totalClientes: clientesConUbicacion.length,
        estado: diaRutaOriginal.estado,
        dividida: false, // Aún no se ha dividido
      },
      subRutaA: {
        id: null, // 🆕 Null porque aún no existe
        nombre: `${diaRutaOriginal.diaSemana} - Grupo A`,
        totalClientes: grupoA.length,
        distanciaKm: (rutaA.totalDistance / 1000).toFixed(2),
        tiempoMinutos: Math.floor(rutaA.totalDuration / 60),
        clientes: grupoA.map(cr => ({
          id: cr.cliente.id,
          nombre: cr.cliente.nombre,
          direccion: `${cr.cliente.calle}, ${cr.cliente.colonia}`,
        })),
      },
      subRutaB: {
        id: null, // 🆕 Null porque aún no existe
        nombre: `${diaRutaOriginal.diaSemana} - Grupo B`,
        totalClientes: grupoB.length,
        distanciaKm: (rutaB.totalDistance / 1000).toFixed(2),
        tiempoMinutos: Math.floor(rutaB.totalDuration / 60),
        clientes: grupoB.map(cr => ({
          id: cr.cliente.id,
          nombre: cr.cliente.nombre,
          direccion: `${cr.cliente.calle}, ${cr.cliente.colonia}`,
        })),
      },
    };
  }

  async confirmarDivisionRuta(dividirRutaDto: DividirRutaDto) {
    const { diaRutaId, puntoCorte, idRepartidorA, idRepartidorB } = dividirRutaDto;

    // 1. Volver a calcular (para seguridad)
    const preview = await this.calcularDivisionRuta(dividirRutaDto);

    // 2. Obtener el día de ruta original nuevamente
    const diaRutaOriginal = await this.diaRutaRepository.findOne({
      where: { id: diaRutaId },
      relations: ['clientesRuta', 'clientesRuta.cliente', 'clientesRuta.precio', 'ruta'],
    });

    if (!diaRutaOriginal) {
      throw new NotFoundException('Ruta no encontrada');
    }

    // 3. Ordenar y dividir clientes
    const clientesConUbicacion = diaRutaOriginal.clientesRuta.filter(
      cr => cr.cliente.latitud && cr.cliente.longitud
    );

    let clientesParaOrdenacion = clientesConUbicacion.map(cr => ({
      id: cr.cliente.id,
      latitud: cr.cliente.latitud!,
      longitud: cr.cliente.longitud!,
      clienteRuta: cr,
    }));

    const clientesOrdenados = this.ordenarPorVecinoMasCercano(clientesParaOrdenacion);
    const grupoA_datos = clientesOrdenados.slice(0, puntoCorte);
    const grupoB_datos = clientesOrdenados.slice(puntoCorte);

    const grupoA = grupoA_datos.map(d => d.clienteRuta);
    const grupoB = grupoB_datos.map(d => d.clienteRuta);

    // ========================================
    // 🆕 4. ELIMINAR TODOS LOS ClienteRuta del original PRIMERO
    // ========================================
    // 💡 OPCIÓN 1: Usando el método delete de TypeORM con la condición de relación
    const resultadoEliminacion = await this.clienteRutaRepository.delete({
      diaRuta: { id: diaRutaId },
    });

    console.log(`🗑️ Eliminación masiva completada para DiaRuta ${diaRutaId}. Registros afectados: ${resultadoEliminacion.affected}`);


    let repA: Usuario | null = null;
    let repB: Usuario | null = null;

    if (idRepartidorA) {
      repA = await this.usuarioRepository.findOneBy({ id: idRepartidorA });
    }
    if (idRepartidorB) {
      repB = await this.usuarioRepository.findOneBy({ id: idRepartidorB });
    }

    // ========================================
    // 5. CREAR SUB-RUTAS
    // ========================================
    const subRutaA = this.diaRutaRepository.create({
      diaSemana: `${diaRutaOriginal.diaSemana} - Grupo A`,
      estado: EstadoDiaRuta.PENDIENTE,
      dividida: false,
      diaRutaPadreId: diaRutaOriginal.id,
      ruta: diaRutaOriginal.ruta,
      repartidor: repA || undefined,
    });
    const subRutaAGuardada = await this.diaRutaRepository.save(subRutaA);

    const subRutaB = this.diaRutaRepository.create({
      diaSemana: `${diaRutaOriginal.diaSemana} - Grupo B`,
      estado: EstadoDiaRuta.PENDIENTE,
      dividida: false,
      diaRutaPadreId: diaRutaOriginal.id,
      ruta: diaRutaOriginal.ruta,
      repartidor: repB || undefined,
    });
    const subRutaBGuardada = await this.diaRutaRepository.save(subRutaB);

    // ========================================
    // 6. CREAR NUEVOS ClienteRuta para las sub-rutas
    // ========================================
    const clientesGrupoA = grupoA.map(cr => {
      return this.clienteRutaRepository.create({
        cliente: cr.cliente,
        diaRuta: subRutaAGuardada,
        precio: cr.precio,
        es_credito: cr.es_credito,
        requiere_factura: cr.requiere_factura,
        visitado: false,
        garrafonesVendidos: null,
      });
    });
    await this.clienteRutaRepository.save(clientesGrupoA);
    console.log(`✅ Creados ${clientesGrupoA.length} ClienteRuta para Grupo A`);

    const clientesGrupoB = grupoB.map(cr => {
      return this.clienteRutaRepository.create({
        cliente: cr.cliente,
        diaRuta: subRutaBGuardada,
        precio: cr.precio,
        es_credito: cr.es_credito,
        requiere_factura: cr.requiere_factura,
        visitado: false,
        garrafonesVendidos: null,
      });
    });
    await this.clienteRutaRepository.save(clientesGrupoB);
    console.log(`✅ Creados ${clientesGrupoB.length} ClienteRuta para Grupo B`);

    // ========================================
    // 7. MARCAR DiaRuta ORIGINAL COMO DIVIDIDA
    // ========================================
    diaRutaOriginal.dividida = true;
    await this.diaRutaRepository.save(diaRutaOriginal);
    console.log('✅ DiaRuta original marcado como dividido');

    // ========================================
    // 8. RETORNAR RESULTADO
    // ========================================
    const rutaA = await this.calcularRutaOptimizada(grupoA);
    const rutaB = await this.calcularRutaOptimizada(grupoB);

    return {
      mensaje: 'Ruta dividida exitosamente',
      rutaOriginal: {
        id: diaRutaOriginal.id,
        nombre: diaRutaOriginal.ruta.nombre,
        diaSemana: diaRutaOriginal.diaSemana,
        totalClientes: 0,
        estado: diaRutaOriginal.estado,
        dividida: true,
      },
      subRutaA: {
        id: subRutaAGuardada.id,
        nombre: subRutaAGuardada.diaSemana,
        totalClientes: grupoA.length,
        distanciaKm: (rutaA.totalDistance / 1000).toFixed(2),
        tiempoMinutos: Math.floor(rutaA.totalDuration / 60),
        clientes: grupoA.map(cr => ({
          id: cr.cliente.id,
          nombre: cr.cliente.nombre,
          direccion: `${cr.cliente.calle}, ${cr.cliente.colonia}`,
        })),
      },
      subRutaB: {
        id: subRutaBGuardada.id,
        nombre: subRutaBGuardada.diaSemana,
        totalClientes: grupoB.length,
        distanciaKm: (rutaB.totalDistance / 1000).toFixed(2),
        tiempoMinutos: Math.floor(rutaB.totalDuration / 60),
        clientes: grupoB.map(cr => ({
          id: cr.cliente.id,
          nombre: cr.cliente.nombre,
          direccion: `${cr.cliente.calle}, ${cr.cliente.colonia}`,
        })),
      },
    };
  }

  // ========================================
  // 🆕 MANTENER EL MÉTODO ORIGINAL POR COMPATIBILIDAD
  // Pero ahora llama a calcularDivisionRuta
  // ========================================
  async dividirRuta(dividirRutaDto: DividirRutaDto) {
    // Ahora solo calcula, no guarda
    return this.calcularDivisionRuta(dividirRutaDto);
  }
  // ========================================
  // 🧠 ORDENAR POR VECINO MÁS CERCANO (Pre-división)
  // ========================================

  private ordenarPorVecinoMasCercano(clientes: any[]): any[] {
    if (clientes.length === 0) return [];

    let clientesRestantes = [...clientes];
    let rutaOrdenada: any[] = [];

    // Elige el primer cliente como punto de inicio arbitrario
    let clienteActual = clientesRestantes.shift();
    rutaOrdenada.push(clienteActual);

    // Iterar hasta que todos los clientes estén en la ruta
    while (clientesRestantes.length > 0) {
      let indiceVecinoMasCercano = -1;
      let distanciaMinima = Infinity;

      // Busca el cliente restante más cercano
      for (let i = 0; i < clientesRestantes.length; i++) {
        const clienteB = clientesRestantes[i];

        const distancia = this.calcularDistanciaHaversine(
          clienteActual.latitud,
          clienteActual.longitud,
          clienteB.latitud,
          clienteB.longitud
        );

        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          indiceVecinoMasCercano = i;
        }
      }

      // Mueve el cliente más cercano a la ruta ordenada
      if (indiceVecinoMasCercano !== -1) {
        clienteActual = clientesRestantes.splice(indiceVecinoMasCercano, 1)[0];
        rutaOrdenada.push(clienteActual);
      } else {
        break;
      }
    }

    return rutaOrdenada;
  }

  // ========================================
  // CALCULAR RUTA OPTIMIZADA (Google Routes API)
  // ========================================


  private async calcularRutaOptimizada(clientesRuta: any[]) {
    if (clientesRuta.length === 0) {
      return { totalDistance: 0, totalDuration: 0, steps: [] };
    }

    const clientesConUbicacion = clientesRuta.filter(
      cr => cr.cliente.latitud && cr.cliente.longitud
    );

    if (clientesConUbicacion.length <= 1) {
      return { totalDistance: 0, totalDuration: 0, steps: [] };
    }

    if (!this.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY no disponible. Usando cálculo Haversine de fallback.');
      return this.ejecutarFallback(clientesConUbicacion);
    }
    // ----------------------------------------------------

    try {
      // Construir waypoints para Google Routes API
      const waypoints = clientesConUbicacion.map(cr => ({
        location: {
          latLng: {
            latitude: parseFloat(cr.cliente.latitud!), // Usar ! aquí es seguro
            longitude: parseFloat(cr.cliente.longitud!),
          },
        },
      }));

      const origen = waypoints[0].location.latLng;
      const destino = waypoints[waypoints.length - 1].location.latLng;
      const intermedios = waypoints.slice(1, -1);

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('X-Goog-Api-Key', this.GOOGLE_API_KEY);
      headers.set('X-Goog-FieldMask', 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline');

      // Llamar a Google Routes API
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            origin: { location: { latLng: origen } },
            destination: { location: { latLng: destino } },
            intermediates: intermedios,
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            computeAlternativeRoutes: false,
            languageCode: 'es-MX',
            units: 'METRIC',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en Google Routes API:', errorText);
        throw new Error('Error calculando ruta optimizada por API');
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No se encontró ninguna ruta');
      }

      const route = data.routes[0];

      return {
        totalDistance: route.distanceMeters || 0,
        totalDuration: parseInt(route.duration?.replace('s', '') || '0'),
        steps: route.polyline?.encodedPolyline || '',
      };

    } catch (error) {
      console.error('Error en el cálculo de la ruta, usando fallback:', error);
      return this.ejecutarFallback(clientesConUbicacion);
    }
  }

  // 💡 Extrae la lógica del fallback a un nuevo método privado
  private ejecutarFallback(clientesConUbicacion: any[]) {
    let distanciaTotal = 0;
    for (let i = 0; i < clientesConUbicacion.length - 1; i++) {
      const a = clientesConUbicacion[i].cliente;
      const b = clientesConUbicacion[i + 1].cliente;
      distanciaTotal += this.calcularDistanciaHaversine(
        parseFloat(a.latitud!),
        parseFloat(a.longitud!),
        parseFloat(b.latitud!),
        parseFloat(b.longitud!)
      );
    }

    // Estimar tiempo (asumiendo velocidad promedio de 30 km/h)
    const VELOCIDAD_KMH = 30;
    const tiempoEstimado = (distanciaTotal / VELOCIDAD_KMH) * 3600; // en segundos

    return {
      totalDistance: distanciaTotal * 1000, // convertir a metros
      totalDuration: tiempoEstimado,
      steps: [],
    };
  }

  // ========================================
  // CALCULAR DISTANCIA HAVERSINE (FALLBACK)
  // ========================================

  private calcularDistanciaHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  async obtenerSubRutasDe(diaRutaPadreId: number) {
    return await this.diaRutaRepository.find({
      where: {
        diaRutaPadreId: diaRutaPadreId,
      },
      relations: ['ruta', 'clientesRuta', 'clientesRuta.cliente'],
    });
  }

  // ========================================
  // OBTENER RUTA COMPLETA CON INFO DE DIVISIÓN
  // ========================================
  async obtenerRutaConInfoDivision(diaRutaId: number) {
    const diaRuta = await this.diaRutaRepository.findOne({
      where: { id: diaRutaId },
      relations: ['ruta', 'clientesRuta', 'clientesRuta.cliente', 'diaRutaPadre'],
    });

    if (!diaRuta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    // Si fue dividida, obtener sus sub-rutas
    let subRutas: DiaRuta[] = [];
    if (diaRuta.dividida) {
      subRutas = await this.obtenerSubRutasDe(diaRuta.id);
    }

    return {
      ...diaRuta,
      subRutas,
    };
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

}