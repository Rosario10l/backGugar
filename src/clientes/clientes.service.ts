import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Precio } from 'src/precios/entities/precio.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
  private clienteRepo: Repository<Cliente>,
    @InjectRepository(Precio)
  private precioRepo: Repository<Precio>
  ){ }


  async createCliente(createClienteDto: CreateClienteDto) {
    try {
      //VERIFICAR QUE EL TIPO DE PRECIO EXISTE
      const tipoPrecio = await this.precioRepo.findOne({
        where: { id: createClienteDto.tipoPrecioId }
      });

      if (!tipoPrecio) {
        throw new BadRequestException(`Tipo de precio con ID ${createClienteDto.tipoPrecioId} no encontrado`);
      }

      const newCliente = this.clienteRepo.create(createClienteDto);
      await this.clienteRepo.save(newCliente);
      return newCliente;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

async findAll() {
    try {
      return await this.clienteRepo.find({
        relations: ['tipoPrecio'] // Cargar tipo de precio
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los clientes');
    }
  }


  async findOne(id: number) {
    try {
      const cliente = await this.clienteRepo.findOne({
        where: { id },
        relations: ['tipoPrecio'] // Cargar tipo de precio
      });
      if (!cliente) {
        throw new NotFoundException(`cliente con el id: ${id} no encontrado`);
      }
      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el cliente');
    }
  }

  async updateCliente(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = await this.clienteRepo.findOneBy({ id });
      if (!cliente) {
        throw new NotFoundException(`cliente con el id: ${id} no encontrado`);
      }

      //VERIFICAR TIPO DE PRECIO SI SE ACTUALIZA
      if (updateClienteDto.tipoPrecioId) {
        const tipoPrecio = await this.precioRepo.findOne({
          where: { id: updateClienteDto.tipoPrecioId }
        });

        if (!tipoPrecio) {
          throw new BadRequestException(`Tipo de precio con ID ${updateClienteDto.tipoPrecioId} no encontrado`);
        }
      }

      const updateCliente = this.clienteRepo.merge(cliente, updateClienteDto);
      return await this.clienteRepo.save(updateCliente);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async removeCliente(id: number) {
    try {
      const cliente = await this.clienteRepo.findOneBy({id});
      if(!cliente){
        throw new NotFoundException(`cliente con el id: ${id} no encontrado`);
      }
      await this.clienteRepo.remove(cliente);
      return {message:`cliente con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
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

}
