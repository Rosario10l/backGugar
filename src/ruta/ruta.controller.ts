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
import { RutasService } from './ruta.service'; // OJO: Verifica si es .ruta.service o .rutas.service
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AuthGuard } from '@nestjs/passport'; 

// 1. IMPORTAR EL DTO QUE FALTABA
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto'; 

@Controller('rutas')
export class RutasController {
  
  constructor(private readonly rutasService: RutasService) {}

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
     return this.rutasService.create(createRutaDto);
  }

  // 2. AGREGAR ESTE MÉTODO QUE FALTABA
  @Post('asignar-cliente')
  asignarCliente(@Body() createClienteRutaDto: CreateClienteRutaDto) {
    return this.rutasService.asignarCliente(createClienteRutaDto);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.findOne(id);
  }

  // Método viejo comentado (lo puedes borrar si quieres)
  @Post(':id/clientes')
  addCliente(@Param('id', ParseIntPipe) idRuta: number) {
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