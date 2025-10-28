import { Injectable } from '@nestjs/common';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

@Injectable()
export class PreciosService {
  create(createPrecioDto: CreatePrecioDto) {
    return 'This action adds a new precio';
  }

  findAll() {
    return `This action returns all precios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} precio`;
  }

  update(id: number, updatePrecioDto: UpdatePrecioDto) {
    return `This action updates a #${id} precio`;
  }

  remove(id: number) {
    return `This action removes a #${id} precio`;
  }
}
