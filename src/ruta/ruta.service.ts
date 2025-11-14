import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ruta } from './entities/ruta.entity';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity'; 
// import { Cliente } from 'src/clientes/entities/cliente.entity'; 
// import { AddClienteRutaDto } from './dto/add-cliente-ruta.dto';

@Injectable()
export class RutasService {

  constructor(
    @InjectRepository(Ruta)
    private rutaRepository: Repository<Ruta>,

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    // @InjectRepository(Cliente)
    // private clienteRepository: Repository<Cliente>,
  ) {}


  // async create(createRutaDto: CreateRutaDto): Promise<Ruta> {
  //   const { idRepartidor, ...rutaData } = createRutaDto;

  //   // 1. Validar que el repartidor exista y sea un repartidor
  //   const repartidor = await this.usuarioRepository.findOneBy({ id: idRepartidor });
  //   if (!repartidor) {
  //     throw new NotFoundException(`Usuario repartidor con ID ${idRepartidor} no encontrado`);
  //   }
  //   if (repartidor.role !== 'repartidor') {
  //     throw new BadRequestException(`El usuario ${repartidor.name} no es un repartidor`);
  //   }


  //   const nuevaRuta = this.rutaRepository.create({
  //     ...rutaData,
  //     idRepartidor: idRepartidor, 
  //     repartidor: repartidor,     
  //     clientes: [],              
  //   });

  //   return this.rutaRepository.save(nuevaRuta);
  // }

 
  findAll(): Promise<Ruta[]> {
    return this.rutaRepository.find({ relations: ['repartidor'] });
  }

  async findOne(id: number): Promise<Ruta> {
    const ruta = await this.rutaRepository.findOne({
      where: { idRuta: id },
      relations: ['repartidor', 'clientes'],
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return ruta;
  }


  // async addClienteToRuta(idRuta: number, addClienteDto: AddClienteRutaDto): Promise<Ruta> {
  //   const { idCliente } = addClienteDto;
    
  //   const ruta = await this.findOne(idRuta); 

  //   const cliente = await this.clienteRepository.findOneBy({ idCliente: idCliente });
  //   if (!cliente) {
  //     throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado`);
  //   }


  //   const yaExiste = ruta.clientes.some(c => c.idCliente === idCliente);
  //   if (yaExiste) {
  //     throw new BadRequestException(`El cliente ${cliente.nombre} ya está en la ruta ${ruta.nombre}`);
  //   }


  //   ruta.clientes.push(cliente);
  //   return this.rutaRepository.save(ruta);
  // }


  async removeClienteFromRuta(idRuta: number, idCliente: number): Promise<Ruta> {

    const ruta = await this.findOne(idRuta);

    // 2. Filtrar el cliente
    // const clienteCountOriginal = ruta.clientes.length;
    // ruta.clientes = ruta.clientes.filter(c => c.idCliente !== idCliente);

    // if (ruta.clientes.length === clienteCountOriginal) {
    //   throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado en la ruta`);
    // }

    return this.rutaRepository.save(ruta);
  }
}