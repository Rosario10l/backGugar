import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { RutasService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';
import { ImportarExcelDto } from './dto/importar-excel.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { DividirRutaDto } from './dto/dividir-ruta.dto';

@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) { }

  // ========================================
  // CREAR / IMPORTAR
  // ========================================

  @Post('importar-excel')
  importarDesdeExcel(@Body() importarDto: ImportarExcelDto) {
    return this.rutasService.importarDesdeExcel(importarDto);
  }

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutasService.create(createRutaDto);
  }

  @Post('crear-con-dia')
  crearRutaConDia(@Body() data: any) {
    return this.rutasService.crearRutaConDia(data);
  }

  @Post('agregar-dia')
  agregarDiaARuta(@Body() data: any) {
    return this.rutasService.agregarDiaARuta(data);
  }

  // @Post('asignar-cliente')
  // asignarCliente(@Body() createClienteRutaDto: CreateClienteRutaDto) {
  //   return this.rutasService.asignarCliente(createClienteRutaDto);
  // }

  // ========================================
  // OBTENER (GET)
  // ========================================

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }

  @Get('clientes-disponibles')
  obtenerClientesDisponiblesSinFiltro() {
    return this.rutasService.obtenerClientesDisponibles();
  }

  @Get('clientes-disponibles/:diaRutaId')
  obtenerClientesDisponiblesConFiltro(
    @Param('diaRutaId', ParseIntPipe) diaRutaId: number,
  ) {
    return this.rutasService.obtenerClientesDisponibles(diaRutaId);
  }

  // @Get('estado/:estado')
  // getRutasPorEstado(@Param('estado') estado: string) {
  //   return this.rutasService.getRutasPorEstado(estado);
  // }

  // @Get('dias-ruta/estado/:estado')
  // getDiasRutaPorEstado(@Param('estado') estado: string) {
  //   return this.rutasService.getDiasRutaPorEstado(estado);
  // }

  @Get('repartidor/:repartidorId')
  obtenerRutasRepartidor(
    @Param('repartidorId', ParseIntPipe) repartidorId: number,
  ) {
    return this.rutasService.obtenerRutasRepartidor(repartidorId);
  }

  @Get(':id')
  async obtenerRutaPorId(@Param('id', ParseIntPipe) id: number) {
    // CORREGIDO: Quitamos el segundo argumento, el servicio ya trae las relaciones
    return this.rutasService.findOne(id);
  }

  // ========================================
  // ACTUALIZAR (PATCH/PUT)
  // ========================================

  @Put(':id')
  async actualizarRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: any,
  ) {
    // CORREGIDO: El método en el servicio se llama 'update'
    return this.rutasService.update(id, updateRutaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: UpdateRutaDto,
  ) {
    return this.rutasService.update(id, updateRutaDto);
  }

  @Patch(':id/asignar-personal')
  asignarPersonal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { supervisorId?: number; repartidorId?: number },
  ) {
    return this.rutasService.asignarPersonalARuta(id, dto);
  }

  @Patch('dia-ruta/:id/estado')
  cambiarEstadoDiaRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { estado: string },
  ) {
    // CORREGIDO: El método en el servicio se llama 'cambiarEstadoDia'
    return this.rutasService.cambiarEstadoDia(id, dto.estado);
  }

  @Patch('dia-ruta/:id/iniciar')
  iniciarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.iniciarDiaRuta(id);
  }

  @Patch('dia-ruta/:id/finalizar')
  finalizarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    // CORREGIDO: 'cambiarEstadoDia'
    return this.rutasService.cambiarEstadoDia(id, 'completada');
  }

  @Patch('dia-ruta/:id/pausar')
  pausarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    // CORREGIDO: 'cambiarEstadoDia'
    return this.rutasService.cambiarEstadoDia(id, 'pausada');
  }

  @Patch('cliente-ruta/:id/visitado')
  marcarClienteVisitado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { visitado: boolean; garrafonesVendidos?: number },
  ) {
    return this.rutasService.marcarClienteVisitado(id, dto);
  }

  // ========================================
  // ELIMINAR (DELETE)
  // ========================================

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.remove(id);
  }

  @Delete(':idDiaRuta/clientes/:idCliente')
  removeCliente(
    @Param('idDiaRuta', ParseIntPipe) idDiaRuta: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.rutasService.removeClienteFromRuta(idDiaRuta, idCliente);
  }

  @Post('asignar-cliente')
  asignarCliente(@Body() data: { clienteId: number; diaRutaId: number; precioId: number }) {
    return this.rutasService.asignarClienteARuta(data);
  }

  @Delete('desasignar-cliente/:clienteId/:diaRutaId')
  desasignarCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @Param('diaRutaId', ParseIntPipe) diaRutaId: number
  ) {
    return this.rutasService.desasignarClienteDeRuta(clienteId, diaRutaId);
  }

  @Post('dividir')
  dividirRuta(@Body() dividirRutaDto: DividirRutaDto) {
    return this.rutasService.dividirRuta(dividirRutaDto);
  }

}
