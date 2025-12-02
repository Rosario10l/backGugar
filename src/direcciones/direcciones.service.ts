import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Direccione } from './entities/direccione.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDireccioneDto } from './dto/create-direccione.dto';
import { UpdateDireccioneDto } from './dto/update-direccione.dto';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Injectable()
export class DireccionesService {
   constructor(
    @InjectRepository(Direccione)
  private direccionRepo: Repository<Direccione>,
    @InjectRepository(Cliente)
  private clienteRepo: Repository<Cliente>
){ }


   async createDireccion(createDireccionDto: CreateDireccioneDto) {
    try {
      //VERIFICAR QUE EL CLIENTE EXISTE
      const cliente = await this.clienteRepo.findOne({
        where: { id: createDireccionDto.clienteId }
      });
      
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${createDireccionDto.clienteId} no encontrado`);
      }

      const newDireccion = this.direccionRepo.create(createDireccionDto);
      await this.direccionRepo.save(newDireccion);
      return newDireccion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la direccion');
    }
  }


   //MÉTODO PARA OBTENER DIRECCIONES POR CLIENTE
  async findByCliente(clienteId: number) {
    try {
      const direcciones = await this.direccionRepo.find({
        where: { clienteId },
        relations: ['cliente'] // Cargar relación con cliente
      });
      return direcciones;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las direcciones del cliente');
    }
  }


    async findAll() {
    try {
      return await this.direccionRepo.find({ relations: ['cliente'] });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las direcciones');
    }
  }


  async findOne(id: number) {
    try {
      const direccion = await this.direccionRepo.findOne({ 
        where: { id },
        relations: ['cliente']
      });
      if (!direccion) {
        throw new NotFoundException(`direccion con el id: ${id} no encontrada`);
      }
      return direccion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la direccion');
    }
  }

 
  async updateDireccion(id: number, UpdateDireccionDto: UpdateDireccioneDto) {
    try {
      const direccion = await this.direccionRepo.findOneBy({ id });
      if (!direccion) {
        throw new NotFoundException(`direccion con el id: ${id} no encontrada`);
      }
      const updateDireccion = this.direccionRepo.merge(direccion, UpdateDireccionDto);
      return await this.direccionRepo.save(updateDireccion);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la direccion');
    }
  }


   async removeDireccion(id: number) {
    try {
      const direccion = await this.direccionRepo.findOneBy({id});
      if(!direccion){
        throw new NotFoundException(`direccion con el id: ${id} no encontrada`);
      }
      await this.direccionRepo.remove(direccion);
      return {message:`direccion con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la direccion');
    }
  }
}
