import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ruta } from './entities/ruta.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { ClienteRuta } from './entities/cliente-ruta.entity';
import { Precio } from 'src/precios/entities/precio.entity'; // ← AGREGAR IMPORT

import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';

@Injectable()
export class RutasService {

  constructor(
    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>,

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,

    @InjectRepository(ClienteRuta)
    private clienteRutaRepository: Repository<ClienteRuta>,

    // ← AGREGAR ESTE REPOSITORIO
    @InjectRepository(Precio)
    private precioRepository: Repository<Precio>,
  ) {}

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
      rutaClientes: [], 
    });

    return await this.rutaRepository.save(nuevaRuta);
  }

  async findAll(): Promise<Ruta[]> {
    return this.rutaRepository.find({
      relations: ['repartidor', 'rutaClientes', 'rutaClientes.cliente', 'rutaClientes.precio'] // ← AGREGAR 'rutaClientes.precio'
    });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { id: id },
      relations: ['repartidor', 'rutaClientes', 'rutaClientes.cliente', 'rutaClientes.precio'], // ← AGREGAR 'rutaClientes.precio'
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return ruta;
  }

  async asignarCliente(datos: CreateClienteRutaDto) {
    // ✅ Cambiar precioGarrafon por precioId
    const { idCliente, rutaId, precioId, diaSemana, esCredito, requiereFactura } = datos;
    
    const ruta = await this.rutaRepository.findOneBy({ id: rutaId });
    if (!ruta) throw new NotFoundException(`Ruta ${rutaId} no encontrada`);

    const cliente = await this.clienteRepository.findOneBy({ id: idCliente });
    if (!cliente) throw new NotFoundException(`Cliente ${idCliente} no encontrado`);

    // ✅ BUSCAR EL PRECIO
    const precio = await this.precioRepository.findOneBy({ id: precioId });
    if (!precio) throw new NotFoundException(`Precio ${precioId} no encontrado`);

    const existe = await this.clienteRutaRepository.findOne({
      where: {
        cliente: { id: idCliente },
        ruta: { id: rutaId }
      }
    });

    if (existe) {
      throw new BadRequestException(`El cliente ${cliente.nombre} ya está en esta ruta.`);
    }

    // ✅ ASIGNAR LA ENTIDAD PRECIO, NO EL NÚMERO
    const nuevaAsignacion = this.clienteRutaRepository.create({
      ruta: ruta,
      cliente: cliente,
      precio: precio, // ← Cambio aquí: asignar la entidad completa
      diaSemana,
      esCredito: esCredito || false,
      requiereFactura: requiereFactura || false
    });

    return await this.clienteRutaRepository.save(nuevaAsignacion);
  }

  async removeClienteFromRuta(idRuta: number, idCliente: number) {
    const relacion = await this.clienteRutaRepository.findOne({
        where: {
            ruta: { id: idRuta },
            cliente: { id: idCliente } 
        }
    });

    if (!relacion) {
        throw new NotFoundException('Ese cliente no pertenece a esa ruta');
    }

    return await this.clienteRutaRepository.remove(relacion);
  }
}