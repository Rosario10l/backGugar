import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UseGuards
} from '@nestjs/common';
import { RutasService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AuthGuard } from '@nestjs/passport'; // <-- Importamos el Guard
// import { AddClienteRutaDto } from './dto/add-cliente-ruta.dto';

@Controller('rutas')
@UseGuards(AuthGuard()) // <-- ¡Todas estas rutas requieren un token JWT!
export class RutasController {
  
  constructor(private readonly rutasService: RutasService) {}

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    // return this.rutasService.create(createRutaDto);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.findOne(id);
  }


  @Post(':id/clientes')
  addCliente(
    @Param('id', ParseIntPipe) idRuta: number,
    // @Body() addClienteDto: AddClienteRutaDto,
  ) {
    // return this.rutasService.addClienteToRuta(idRuta, addClienteDto);
  }


  @Delete(':id/clientes/:idCliente')
  removeCliente(
    @Param('id', ParseIntPipe) idRuta: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.rutasService.removeClienteFromRuta(idRuta, idCliente);
  }
}