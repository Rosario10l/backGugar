import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Repository } from 'typeorm';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Injectable()
export class PedidosService {
constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    @InjectRepository(Precio)
    private precioRepo: Repository<Precio>,
  ) { }


async createPedido(createPedidoDto: CreatePedidoDto) {
  try {
    const cliente = await this.clienteRepo.findOne({
      where: { id: createPedidoDto.clienteId },
      relations: ['tipoPrecio'] //Cargar tipoPrecio
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${createPedidoDto.clienteId} no encontrado`);
    }

    //OBTENER PRECIO DIRECTAMENTE DE LA RELACIÓN
    if (!cliente.tipoPrecio) {
      throw new NotFoundException(`El cliente no tiene un tipo de precio asignado`);
    }

    const newPedido = this.pedidoRepo.create(createPedidoDto);
    
    //CALCULAR CON PRECIO DEL TIPO ASIGNADO
    newPedido.calcularTotal(cliente.tipoPrecio.precioPorGarrafon);
    
    await this.pedidoRepo.save(newPedido);
    
    return {
      ...newPedido,
      precioAplicado: cliente.tipoPrecio.precioPorGarrafon,
      tipoCompra: cliente.tipoPrecio.tipoCompra
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
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


async updatePedido(id: number, updatePedidoDto: UpdatePedidoDto) {
  try {
    const pedido = await this.pedidoRepo.findOneBy({ id });
    if (!pedido) {
      throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
    }
    
    // Si se actualiza la cantidad, recalcular el total
    if (updatePedidoDto.cantidadGarrafones) {
      pedido.cantidadGarrafones = updatePedidoDto.cantidadGarrafones;
      await this.calcularTotalPedido(id);
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


  async calcularTotalPedido(id: number): Promise<Pedido> {
  try {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['cliente', 'cliente.tipoPrecio'] //Agregar 'cliente.tipoPrecio'
    });
    
    if (!pedido) {
      throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
    }

    //se usa la relación directa con precio
    if (!pedido.cliente.tipoPrecio) {
      throw new NotFoundException(`El cliente no tiene un tipo de precio asignado`);
    }

    // Recalcular el total con el precio del tipo asignado al cliente
    pedido.calcularTotal(pedido.cliente.tipoPrecio.precioPorGarrafon);
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
