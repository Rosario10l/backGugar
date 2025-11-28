// services/ventas.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Repository } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Precio } from '../precios/entities/precio.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,

    @InjectRepository(Precio)
    private precioRepo: Repository<Precio>,

  /*  @InjectRepository(ClienteRuta)
    private clienteRutaRepo: Repository<ClienteRuta>*/
  ) {}

   /*async createVenta(createVentaDto: CreateVentaDto) {
    try {
      // Verificar que el cliente_ruta existe
      const clienteRuta = await this.clienteRutaRepo.findOne({
        where: { id: createVentaDto.clienteRutaId },
        relations: ['cliente', 'ruta']
      });

      if (!clienteRuta) {
        throw new NotFoundException(`ClienteRuta con ID ${createVentaDto.clienteRutaId} no encontrado`);
      }

      // Verificar que el precio existe
      const precio = await this.precioRepo.findOne({
        where: { id: createVentaDto.precioId }
      });

      if (!precio) {
        throw new NotFoundException(`Precio con ID ${createVentaDto.precioId} no encontrado`);
      }

      const nuevaVenta = this.ventaRepo.create(createVentaDto);
      
      // Asignar relaciones
      nuevaVenta.clienteRuta = clienteRuta;
      nuevaVenta.precio = precio;
      
      // Calcular total automáticamente
      nuevaVenta.calcularTotal();
      
      await this.ventaRepo.save(nuevaVenta);
      return nuevaVenta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la venta');
    }
  }*/

  async findAll() {
    try {
      return await this.ventaRepo.find({
        relations: ['precio', 'clienteRuta', 'clienteRuta.cliente', 'clienteRuta.ruta']
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }

  async findOne(id: number) {
    try {
      const venta = await this.ventaRepo.findOne({
        where: { id },
        relations: ['precio', 'clienteRuta', 'clienteRuta.cliente', 'clienteRuta.ruta']
      });
      if (!venta) {
        throw new NotFoundException(`Venta con el id: ${id} no encontrada`);
      }
      return venta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la venta');
    }
  }


  async updateVenta(id: number, updateVentaDto: UpdateVentaDto) {
    try {
      const venta = await this.ventaRepo.findOne({
        where: { id },
        relations: ['precio']
      });
      if (!venta) {
        throw new NotFoundException(`Venta con el id: ${id} no encontrada`);
      }

      // Si se actualiza el precio, verificar que existe
      if (updateVentaDto.precioId) {
        const precio = await this.precioRepo.findOne({
          where: { id: updateVentaDto.precioId }
        });
        if (!precio) {
          throw new NotFoundException(`Precio con ID ${updateVentaDto.precioId} no encontrado`);
        }
        venta.precio = precio;
      }

      // Si se actualiza cantidad o precio, recalcular total
      if (updateVentaDto.cantidadVendida || updateVentaDto.precioId) {
        if (updateVentaDto.cantidadVendida) {
          venta.cantidadVendida = updateVentaDto.cantidadVendida;
        }
        venta.calcularTotal();
      }

      const updatedVenta = this.ventaRepo.merge(venta, updateVentaDto);
      return await this.ventaRepo.save(updatedVenta);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la venta');
    }
  }

  async removeVenta(id: number) {
    try {
      const venta = await this.ventaRepo.findOneBy({ id });
      if (!venta) {
        throw new NotFoundException(`Venta con el id: ${id} no encontrada`);
      }
      await this.ventaRepo.remove(venta);
      return { message: `Venta con el id: ${id} se ha eliminado` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la venta');
    }
  }

  // metodo para obtener ventas por fecha
  async findByFecha(fecha: Date) {
    try {
      return await this.ventaRepo.find({
        where: { fecha },
        relations: ['precio']
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener ventas por fecha');
    }
  }

//para calcular el total del dia
  async calcularTotalDelDia(fecha: Date) {
    try {
      const ventas = await this.findByFecha(fecha);
      const total = ventas.reduce((sum, venta) => sum + parseFloat(venta.total.toString()), 0);
      return {
        fecha,
        totalVentas: ventas.length,
        totalIngresos: total
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al calcular total del día');
    }
  }
}