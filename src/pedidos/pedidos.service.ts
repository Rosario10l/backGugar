import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';

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

 
  // En tu pedidos.service.ts - método updatePedido
async updatePedido(id: number, updatePedidoDto: UpdatePedidoDto) {
    try {
        const pedido = await this.pedidoRepo.findOneBy({ id });
        if (!pedido) {
            throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
        }
        
        // Si se actualiza la cantidad, recalcular el total
        if (updatePedidoDto.cantidadGarrafones) {
            pedido.cantidadGarrafones = updatePedidoDto.cantidadGarrafones;
        }
        
        // Actualizar otros campos
        const updatedPedido = this.pedidoRepo.merge(pedido, updatePedidoDto);
        return await this.pedidoRepo.save(updatedPedido);
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


  async calcularTotalPedido(id: number, precioPorGarrafon: number): Promise<Pedido> {
        try {
            const pedido = await this.pedidoRepo.findOneBy({ id });
            if (!pedido) {
                throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
            }

            // Calcular y actualizar el total
            pedido.calcularTotal(precioPorGarrafon);
            return await this.pedidoRepo.save(pedido);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error al calcular el total del pedido');
        }
    }



    async actualizarEstadoPedido(id: number, updateEstadoPedidoDto: UpdateEstadoPedidoDto): Promise<Pedido> {
    try {
      const pedido = await this.pedidoRepo.findOneBy({ id });
      if (!pedido) {
        throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
      }

      // Actualizar el estado usando el método de la entidad
      pedido.actualizarEstado(updateEstadoPedidoDto.estado);
      
      return await this.pedidoRepo.save(pedido);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('Estado no válido')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Error al actualizar el estado del pedido');
    }
  }


   

}
