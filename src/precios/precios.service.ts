import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Precio } from './entities/precio.entity';
import { Repository } from 'typeorm';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

@Injectable()
export class PreciosService {
  constructor(
    @InjectRepository(Precio)
  private precioRepo: Repository<Precio>){ }


  async createPrecio(CreatePrecioDto: CreatePrecioDto) {
    try {
      const newPrecio = this.precioRepo.create(CreatePrecioDto);
      await this.precioRepo.save(newPrecio);
      return newPrecio;
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el precio');
    }
  }

    async findAll() {
    try {
      return await this.precioRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los precios');
    }
  }

  async findOne(id: number) {
    try {
      const precio = await this.precioRepo.findOneBy({ id });
      if (!precio) {
        throw new NotFoundException(`precio con el id: ${id} no encontrado`);
      }
      return precio;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el precio');
    }
  }

//modificamos esta 
  async updatePrecio(id: number, UpdatePrecioDto: UpdatePrecioDto) {
    try {
      const precio = await this.precioRepo.findOneBy({ id });
      if (!precio) {
        throw new NotFoundException(`precio con el id: ${id} no encontrado`);
      }
      const updatePrecio = this.precioRepo.merge(precio, UpdatePrecioDto);
      return await this.precioRepo.save(updatePrecio);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el precio');
    }
  }


   async removePrecio(id: number) {
    try {
      const precio = await this.precioRepo.findOneBy({id});
      if(!precio){
        throw new NotFoundException(`precio con el id: ${id} no encontrado`);
      }
      await this.precioRepo.remove(precio);
      return {message:`precio con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el precio');
    }
  }
}

