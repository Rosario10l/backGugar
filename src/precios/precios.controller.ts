import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreciosService } from './precios.service';
import { CreatePrecioDto } from './dto/create-precio.dto';
import { UpdatePrecioDto } from './dto/update-precio.dto';

@Controller('precios')
export class PreciosController {
  constructor(private readonly preciosService: PreciosService) {}

  @Post()
  create(@Body() createPrecioDto: CreatePrecioDto) {
    return this.preciosService.create(createPrecioDto);
  }

  @Get()
  findAll() {
    return this.preciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preciosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrecioDto: UpdatePrecioDto) {
    return this.preciosService.update(+id, updatePrecioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preciosService.remove(+id);
  }
}
