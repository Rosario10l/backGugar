import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Between, LessThan, Repository } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Precio } from '../precios/entities/precio.entity';
import { ClienteRuta } from 'src/ruta/entities/cliente-ruta.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,

    @InjectRepository(Precio)
    private precioRepo: Repository<Precio>,

    @InjectRepository(ClienteRuta)
    private clienteRutaRepo: Repository<ClienteRuta>
  ) {}

  async createVenta(createVentaDto: CreateVentaDto) {
    try {
      const clienteRuta = await this.clienteRutaRepo.findOne({
        where: { id: createVentaDto.clienteRutaId },
        relations: ['cliente', 'precio']
      });

      if (!clienteRuta) {
        throw new NotFoundException(`ClienteRuta con ID ${createVentaDto.clienteRutaId} no encontrado`);
      }

      const precio = await this.precioRepo.findOne({
        where: { id: createVentaDto.precioId }
      });

      if (!precio) {
        throw new NotFoundException(`Precio con ID ${createVentaDto.precioId} no encontrado`);
      }

      const nuevaVenta = this.ventaRepo.create(createVentaDto);
      
      nuevaVenta.clienteRuta = clienteRuta;
      nuevaVenta.precio = precio;
      
      // Solo calcular total si hay cantidad > 0
      if (createVentaDto.cantidadVendida > 0) {
        nuevaVenta.calcularTotal();
      } else {
        nuevaVenta.total = 0;
      }
      
      await this.ventaRepo.save(nuevaVenta);
      return nuevaVenta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error creando venta:', error);
      throw new InternalServerErrorException('Error al crear la venta');
    }
  }

  async findAll() {
    try {
      return await this.ventaRepo.find({
        relations: [
          'precio', 
          'clienteRuta', 
          'clienteRuta.cliente',
          'clienteRuta.diaRuta',
          'clienteRuta.diaRuta.ruta'
        ]
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
  }

  async findOne(id: number) {
    try {
      const venta = await this.ventaRepo.findOne({
        where: { id },
        relations: [
          'precio', 
          'clienteRuta', 
          'clienteRuta.cliente'
        ]
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

  async findByDiaRuta(diaRutaId: number) {
    try {
      return await this.ventaRepo
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.clienteRuta', 'clienteRuta')
        .leftJoinAndSelect('clienteRuta.cliente', 'cliente')
        .leftJoinAndSelect('clienteRuta.diaRuta', 'diaRuta')
        .leftJoinAndSelect('venta.precio', 'precio')
        .where('diaRuta.id = :diaRutaId', { diaRutaId })
        .getMany();
    } catch (error) {
      console.error('Error en findByDiaRuta:', error);
      throw new InternalServerErrorException('Error al obtener ventas por día de ruta');
    }
  }

  async findByRangoFechas(inicio: Date, fin: Date) {
    try {
      return await this.ventaRepo.find({
        where: {
          fecha: Between(inicio, fin)
        },
        relations: [
          'precio',
          'clienteRuta',
          'clienteRuta.cliente',
          'clienteRuta.diaRuta',
          'clienteRuta.diaRuta.ruta'
        ],
        order: {
          fecha: 'DESC'
        }
      });
    } catch (error) {
      console.error('Error obteniendo ventas por rango:', error);
      throw new InternalServerErrorException('Error al obtener ventas por rango de fechas');
    }
  }

  async eliminarVentasAntiguas() {
    try {
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      hace7Dias.setHours(0, 0, 0, 0);

      const ventasAntiguas = await this.ventaRepo.find({
        where: {
          fecha: LessThan(hace7Dias)
        }
      });

      const cantidad = ventasAntiguas.length;

      if (cantidad > 0) {
        await this.ventaRepo.remove(ventasAntiguas);
      }

      return {
        success: true,
        message: `Se eliminaron ${cantidad} ventas antiguas`,
        cantidad,
        fechaCorte: hace7Dias
      };
    } catch (error) {
      console.error('Error eliminando ventas antiguas:', error);
      throw new InternalServerErrorException('Error al eliminar ventas antiguas');
    }
  }

  @Cron('59 23 * * 0') // Cada domingo a las 23:59
  async limpiezaAutomaticaSemanal() {
    console.log('🧹 Ejecutando limpieza automática de ventas antiguas...');
    
    try {
      const resultado = await this.eliminarVentasAntiguas();
      console.log(`✅ Limpieza completada: ${resultado.cantidad} ventas eliminadas`);
    } catch (error) {
      console.error('❌ Error en limpieza automática:', error);
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

      if (updateVentaDto.precioId) {
        const precio = await this.precioRepo.findOne({
          where: { id: updateVentaDto.precioId }
        });
        if (!precio) {
          throw new NotFoundException(`Precio con ID ${updateVentaDto.precioId} no encontrado`);
        }
        venta.precio = precio;
      }

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

  async findByFecha(fecha: Date) {
    try {
      const inicio = new Date(fecha);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);

      return await this.ventaRepo.find({
        where: {
          fecha: Between(inicio, fin)
        },
        relations: ['precio', 'clienteRuta', 'clienteRuta.cliente']
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener ventas por fecha');
    }
  }

  async calcularTotalDelDia(fecha: Date) {
    try {
      const ventas = await this.findByFecha(fecha);
      const ventasRealizadas = ventas.filter(v => v.estado === 'realizado');
      
      const totalGarrafones = ventasRealizadas.reduce((sum, v) => sum + v.cantidadVendida, 0);
      const totalIngresos = ventasRealizadas.reduce((sum, venta) => sum + parseFloat(venta.total.toString()), 0);
      
      return {
        fecha,
        totalVentas: ventasRealizadas.length,
        ventasSaltadas: ventas.filter(v => v.estado === 'saltado').length,
        totalGarrafones,
        totalIngresos
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al calcular total del día');
    }
  }
}