// src/ruta/ruta.controller.ts
// ✅ CORREGIDO - Todos los endpoints usan los métodos HTTP correctos

import {
  Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch, Put
} from '@nestjs/common';
import { RutasService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { CreateClienteRutaDto } from './dto/create-cliente-ruta.dto';
import { ImportarExcelDto } from './dto/importar-excel.dto';

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
  crearRutaConDia(@Body() data: {
    nombre: string;
    supervisorId: number | null;
    repartidorId: number | null;
    diaSemana: string;
    clientesIds: number[];
  }) {
    return this.rutasService.crearRutaConDia(data);
  }

  @Post('agregar-dia')
  agregarDiaARuta(@Body() data: {
    rutaId: number;
    diaSemana: string;
    clientesIds: number[];
  }) {
    return this.rutasService.agregarDiaARuta(data);
  }

  @Post('asignar-cliente')
  asignarCliente(@Body() createClienteRutaDto: CreateClienteRutaDto) {
    return this.rutasService.asignarCliente(createClienteRutaDto);
  }

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
  obtenerClientesDisponiblesConFiltro(@Param('diaRutaId', ParseIntPipe) diaRutaId: number) {
    return this.rutasService.obtenerClientesDisponibles(diaRutaId);
  }

  @Get('estado/:estado')
  getRutasPorEstado(@Param('estado') estado: string) {
    return this.rutasService.getRutasPorEstado(estado);
  }

  @Get('dias-ruta/estado/:estado')
  getDiasRutaPorEstado(@Param('estado') estado: string) {
    return this.rutasService.getDiasRutaPorEstado(estado);
  }

  @Get('repartidor/:repartidorId')
  obtenerRutasRepartidor(@Param('repartidorId', ParseIntPipe) repartidorId: number) {
    return this.rutasService.obtenerRutasRepartidor(repartidorId);
  }

  @Get(':id')
  async obtenerRutaPorId(@Param('id', ParseIntPipe) id: number) {
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

  // ========================================
  // ACTUALIZAR (PATCH/PUT)
  // ========================================

  @Put(':id')
  async actualizarRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: any
  ) {
    return this.rutasService.actualizarRuta(id, updateRutaDto);
  }

  @Patch(':id/asignar-personal')
  asignarPersonal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { supervisorId?: number; repartidorId?: number }
  ) {
    return this.rutasService.asignarPersonalARuta(id, dto);
  }

  @Patch('dia-ruta/:id/estado')
  cambiarEstadoDiaRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { estado: string }
  ) {
    return this.rutasService.cambiarEstadoDiaRuta(id, dto.estado);
  }

  // ✅ CORREGIDO: POST → PATCH
  @Patch('dia-ruta/:id/iniciar')
  iniciarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.iniciarDiaRuta(id);
  }

  // ✅ CORREGIDO: POST → PATCH
  @Patch('dia-ruta/:id/finalizar')
  finalizarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.cambiarEstadoDiaRuta(id, 'completada');
  }

  // ✅ CORREGIDO: POST → PATCH
  @Patch('dia-ruta/:id/pausar')
  pausarDiaRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.cambiarEstadoDiaRuta(id, 'pausada');
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
}