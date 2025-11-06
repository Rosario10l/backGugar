import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { CreateDireccioneDto } from './dto/create-direccione.dto';
import { UpdateDireccioneDto } from './dto/update-direccione.dto';

@Controller('direcciones')
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Post()
  create(@Body() createDireccioneDto: CreateDireccioneDto) {
    return this.direccionesService.createDireccion(createDireccioneDto);
  }

  @Get('all')
  findAll() {
    return this.direccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.direccionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDireccioneDto: UpdateDireccioneDto) {
    return this.direccionesService.updateDireccion(+id, updateDireccioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.direccionesService.removeDireccion(+id);
  }

   // ENDPOINT PARA OBTENER DIRECCIONES POR CLIENTE
  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.direccionesService.findByCliente(clienteId);
  }

}
