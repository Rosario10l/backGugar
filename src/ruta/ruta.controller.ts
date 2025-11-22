import {
  Controller, Get, Post, Body, Param, Delete, ParseIntPipe,
  Patch, Query
} from '@nestjs/common';
import { RutasService } from './ruta.service'; // OJO: Verifica si es .ruta.service o .rutas.service
import { CreateRutaDto } from './dto/create-ruta.dto';
import { AuthGuard } from '@nestjs/passport';

import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';
import { ImportarExcelDto } from './dto/importar-excel.dto';

import { AsignarPersonalDto } from './dto/asignar-personal.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';
import { EstadoDiaRuta } from './entities/dia-ruta.entity';
import { EstadoRuta } from './entities/ruta.entity';



@Controller('rutas')
export class RutasController {

  constructor(private readonly rutasService: RutasService) { }


  @Post('importar-excel')
  async importarDesdeExcel(@Body() importarDto: ImportarExcelDto) {
    return this.rutasService.importarDesdeExcel(importarDto);
  }

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

//    @Post('asignar-personal')
//   async asignarPersonal(@Body() dto: AsignarPersonalDto) {
//     return this.rutasService.asignarPersonal(dto);
//   }

//   /**
//    * ACTUALIZAR ESTADO DE UN DÍA DE RUTA
//    * PATCH /rutas/dia-ruta/estado
//    */
//   @Patch('dia-ruta/estado')
//   async actualizarEstadoDiaRuta(@Body() dto: ActualizarEstadoDto) {
//     return this.rutasService.actualizarEstadoDiaRuta(dto);
//   }

//   /**
//    * OBTENER RUTAS POR ESTADO
//    * GET /rutas/por-estado?estado=pendiente
//    */
//   @Get('por-estado')
//   async getRutasPorEstado(@Query('estado') estado: EstadoRuta) {
//     return this.rutasService.getRutasPorEstado(estado);
//   }

//   /**
//    * OBTENER DÍAS DE RUTA POR ESTADO
//    * GET /rutas/dias-por-estado?estado=en_curso
//    */
//   @Get('dias-por-estado')
//   async getDiasRutaPorEstado(@Query('estado') estado: EstadoDiaRuta) {
//     return this.rutasService.getDiasRutaPorEstado(estado);
//   }

//   /**
//    * INICIAR DÍA DE RUTA (cambiar a EN_CURSO)
//    * POST /rutas/dia-ruta/:id/iniciar
//    */
//   @Post('dia-ruta/:id/iniciar')
//   async iniciarDiaRuta(@Param('id') id: number) {
//     return this.rutasService.iniciarDiaRuta(id);
//   }

//   /**
//    * FINALIZAR DÍA DE RUTA (cambiar a COMPLETADA)
//    * POST /rutas/dia-ruta/:id/finalizar
//    */
//   @Post('dia-ruta/:id/finalizar')
//   async finalizarDiaRuta(@Param('id') id: number) {
//     return this.rutasService.finalizarDiaRuta(id);
//   }

//   /**
//    * PAUSAR DÍA DE RUTA
//    * POST /rutas/dia-ruta/:id/pausar
//    */
//   @Post('dia-ruta/:id/pausar')
//   async pausarDiaRuta(@Param('id') id: number) {
//     return this.rutasService.pausarDiaRuta(id);
//   }
}
