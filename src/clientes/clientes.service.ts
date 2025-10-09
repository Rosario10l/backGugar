import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
  private clienteRepo: Repository<Cliente>){ }


  async createCliente(createClienteDto: CreateClienteDto) {
    try {
      const newCliente = this.clienteRepo.create(createClienteDto);
      await this.clienteRepo.save(newCliente);
      return newCliente;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

async findAll() {
    try {
      return await this.clienteRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los clientes');
    }
  }


  async findOne(id: number) {
    try {
      const cliente = await this.clienteRepo.findOneBy({ id });
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
      const updateCliente = this.clienteRepo.merge(cliente, updateClienteDto);
      return await this.clienteRepo.save(updateCliente);
    } catch (error) {
      if (error instanceof NotFoundException) {
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
}
