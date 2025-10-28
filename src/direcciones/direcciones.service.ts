import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Direccione } from './entities/direccione.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDireccioneDto } from './dto/create-direccione.dto';
import { UpdateDireccioneDto } from './dto/update-direccione.dto';

@Injectable()
export class DireccionesService {
   constructor(
    @InjectRepository(Direccione)
  private direccionRepo: Repository<Direccione>){ }


  async createDireccion(CreateDireccionDto: CreateDireccioneDto) {
    try {
      const newDireccion = this.direccionRepo.create(CreateDireccionDto);
      await this.direccionRepo.save(newDireccion);
      return newDireccion;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la direccion');
    }
  }


    async findAll() {
    try {
      return await this.direccionRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las direcciones');
    }
  }


  async findOne(id: number) {
    try {
      const direccion = await this.direccionRepo.findOneBy({ id });
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
