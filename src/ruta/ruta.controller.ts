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
  @Post('crear-con-dia')
  crearRutaConDia(@Body() data: any) {
    return this.rutasService.crearRutaConDia(data);
  }

  @Post('agregar-dia')
  agregarDiaARuta(@Body() data: any) {
    return this.rutasService.agregarDiaARuta(data);
  }
  @Patch('dia-ruta/:id/estado')
  async cambiarEstadoDia(
    @Param('id') id: number, 
    @Body('estado') estado: string
  ) {
    // Necesitas crear este método en tu servicio (ver abajo)
    return this.rutasService.cambiarEstadoDia(id, estado);
  }
}