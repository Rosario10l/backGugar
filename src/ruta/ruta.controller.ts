import {
  Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch,
  Put
} from '@nestjs/common';
import { RutasService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';
import { ImportarExcelDto } from './dto/importar-excel.dto';

@Controller('rutas')
export class RutasController {

  constructor(private readonly rutasService: RutasService) { }

  // ========================================
  // IMPORTACIÓN DE EXCEL
  // ========================================

  @Post('importar-excel')
  importarDesdeExcel(@Body() importarDto: ImportarExcelDto) {
    return this.rutasService.importarDesdeExcel(importarDto);
  }

  // ========================================
  // CRUD BÁSICO DE RUTAS
  // ========================================

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get(':id')
  async obtenerRutaPorId(@Param('id') id: number) {
    return this.rutasService.findOne(id, {
      relations: [
        'supervisor',
        'repartidor',
        'diasRuta',
        'diasRuta.clientesRuta',
        'diasRuta.clientesRuta.cliente',
        'diasRuta.clientesRuta.cliente.direcciones',
        'diasRuta.clientesRuta.precio'
      ]
    });
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Implementar después si lo necesitas
    return { message: 'Eliminar ruta pendiente de implementar' };
  }

  // ========================================
  // GESTIÓN DE CLIENTES EN RUTAS
  // ========================================

  @Post('asignar-cliente')
  asignarCliente(@Body() createClienteRutaDto: CreateClienteRutaDto) {
    return this.rutasService.asignarCliente(createClienteRutaDto);
  }

  @Delete(':idDiaRuta/clientes/:idCliente')
  removeCliente(
    @Param('idDiaRuta', ParseIntPipe) idDiaRuta: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.rutasService.removeClienteFromRuta(idDiaRuta, idCliente);
  }

  // ========================================
  // FILTROS POR ESTADO
  // ========================================

  /**
   * OBTENER RUTAS POR ESTADO
   * GET /rutas/estado/pendiente
   */
  @Get('estado/:estado')
  getRutasPorEstado(@Param('estado') estado: string) {
    return this.rutasService.getRutasPorEstado(estado);
  }

  /**
   * OBTENER DÍAS DE RUTA POR ESTADO
   * GET /rutas/dias-ruta/estado/en_curso
   */
  @Get('dias-ruta/estado/:estado')
  getDiasRutaPorEstado(@Param('estado') estado: string) {
    return this.rutasService.getDiasRutaPorEstado(estado);
  }

  // ========================================
  // GESTIÓN DE PERSONAL
  // ========================================

  /**
   * ASIGNAR SUPERVISOR/REPARTIDOR A UNA RUTA
   * PATCH /rutas/:id/asignar-personal
   */
  @Patch(':id/asignar-personal')
  asignarPersonal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { supervisorId?: number; repartidorId?: number }
  ) {
    return this.rutasService.asignarPersonalARuta(id, dto);
  }

  // ========================================
  // GESTIÓN DE ESTADOS DE DÍAS DE RUTA
  // ========================================

  /**
   * CAMBIAR ESTADO DE DÍA DE RUTA
   * PATCH /rutas/dia-ruta/:id/estado
   */
  @Patch('dia-ruta/:id/estado')
  cambiarEstadoDiaRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { estado: string }
  ) {
    return this.rutasService.cambiarEstadoDiaRuta(id, dto.estado);
  }

  /**
   * INICIAR DÍA DE RUTA (cambiar a EN_CURSO)
   * POST /rutas/dia-ruta/:id/iniciar
   */
  @Post('dia-ruta/:id/iniciar')
  iniciarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.cambiarEstadoDiaRuta(id, 'en_curso');
  }

  /**
   * FINALIZAR DÍA DE RUTA (cambiar a COMPLETADA)
   * POST /rutas/dia-ruta/:id/finalizar
   */
  @Post('dia-ruta/:id/finalizar')
  finalizarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.cambiarEstadoDiaRuta(id, 'completada');
  }

  /**
   * PAUSAR DÍA DE RUTA
   * POST /rutas/dia-ruta/:id/pausar
   */
  @Post('dia-ruta/:id/pausar')
  pausarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.cambiarEstadoDiaRuta(id, 'pausada');
  }



  @Put(':id')
  async actualizarRuta(
    @Param('id') id: number,
    @Body() updateRutaDto: any
  ) {
    return this.rutasService.actualizarRuta(id, updateRutaDto);
  }

}