import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
constructor(
    @InjectRepository(Pedido)
  private pedidoRepo: Repository<Pedido>){ }


  async createPedido(CreatePedidoDto: CreatePedidoDto) {
    try {
      const newPedido = this.pedidoRepo.create(CreatePedidoDto);
      await this.pedidoRepo.save(newPedido);
      return newPedido;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el pedido');
    }
  }

    async findAll() {
    try {
      return await this.pedidoRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los pedidos');
    }
  }


  async findOne(id: number) {
    try {
      const pedido = await this.pedidoRepo.findOneBy({ id });
      if (!pedido) {
        throw new NotFoundException(`pedido con el id: ${id} no encontrado`);
      }
      return pedido;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el pedido');
    }
  }

 
  async updatePedido(id: number, UpdatePedidoDto: UpdatePedidoDto) {
    try {
      const pedido = await this.pedidoRepo.findOneBy({ id });
      if (!pedido) {
        throw new NotFoundException(`Empleado con el id: ${id} no encontrado`);
      }
      const updatePedido = this.pedidoRepo.merge(pedido, UpdatePedidoDto);
      return await this.pedidoRepo.save(updatePedido);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el pedido');
    }
  }


   async removePedido(id: number) {
    try {
      const pedido = await this.pedidoRepo.findOneBy({id});
      if(!pedido){
        throw new NotFoundException(`pedido con el id: ${id} no encontrado`);
      }
      await this.pedidoRepo.remove(pedido);
      return {message:`pedido con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el pedido');
    }
  }
}
