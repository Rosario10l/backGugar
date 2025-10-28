import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Precio } from './entities/precio.entity';

@Injectable()
export class PedidosService {
constructor(
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    @InjectRepository(Precio)
    private precioRepo: Repository<Precio>,
  ) {
    this.inicializarPrecios(); // Se ejecuta al iniciar el servicio
  }


 private async inicializarPrecios() {
    const preciosExistentes = await this.precioRepo.find();
    
    if (preciosExistentes.length === 0) {
      const preciosIniciales = [
        { 
          tipoCompra: 'menudeo', 
          precioPorGarrafon: 50, 
          fechaVigencia: new Date() 
        },
        { 
          tipoCompra: 'mayoreo', 
          precioPorGarrafon: 45, 
          fechaVigencia: new Date() 
        }
      ];
      
      await this.precioRepo.save(preciosIniciales);
      console.log('Precios iniciales creados automáticamente');
    }
  }

  async createPedido(createPedidoDto: CreatePedidoDto) {
    try {
      // Verificar que el cliente existe
      const cliente = await this.clienteRepo.findOne({
        where: { id: createPedidoDto.clienteId }
      });
      
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${createPedidoDto.clienteId} no encontrado`);
      }

      // OBTENER PRECIO SEGÚN esMayoreo (true = mayoreo, false = menudeo)
      const tipoCompra = cliente.esMayoreo ? 'mayoreo' : 'menudeo';
      const precioActual = await this.precioRepo.findOne({
        where: { tipoCompra },
        order: { fechaVigencia: 'DESC' }
      });

      if (!precioActual) {
        throw new NotFoundException(`No se encontró precio para ${tipoCompra}`);
      }

      const newPedido = this.pedidoRepo.create(createPedidoDto);
      
      // Calcular el total con el precio actual
      newPedido.calcularTotal(precioActual.precioPorGarrafon);
      
      await this.pedidoRepo.save(newPedido);
      
      return {
        ...newPedido,
        precioAplicado: precioActual.precioPorGarrafon,
        tipoCompra: tipoCompra,
        esMayoreo: cliente.esMayoreo // Para verificar en respuesta
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


  async calcularTotalPedido(id: number): Promise<Pedido> {
    try {
      const pedido = await this.pedidoRepo.findOne({
        where: { id },
        relations: ['cliente']
      });
      
      if (!pedido) {
        throw new NotFoundException(`Pedido con el id: ${id} no encontrado`);
      }

      // Usar esMayoreo para determinar el tipo de compra
      const tipoCompra = pedido.cliente.esMayoreo ? 'mayoreo' : 'menudeo';
      const precioActual = await this.precioRepo.findOne({
        where: { tipoCompra },
        order: { fechaVigencia: 'DESC' }
      });

      if (!precioActual) {
        throw new NotFoundException(`No se encontró precio para ${tipoCompra}`);
      }

      // Recalcular el total
      pedido.calcularTotal(precioActual.precioPorGarrafon);
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
