import { 
  Controller, Get, Post, Body, Param, Delete, ParseIntPipe, 
  Patch
} from '@nestjs/common';
import { RutasService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
@Controller('rutas')
export class RutasController {
  
  constructor(private readonly rutasService: RutasService) {}

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.findOne(id);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: UpdateRutaDto,
  ) {
    return this.rutasService.update(id, updateRutaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.remove(id);
  }
}