import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.createVenta(createVentaDto);
  }

  @Get("all")
  findAll() {
    return this.ventasService.findAll();
  }

  @Get('dia-ruta/:diaRutaId')
  findByDiaRuta(@Param('diaRutaId', ParseIntPipe) diaRutaId: number) {
    return this.ventasService.findByDiaRuta(diaRutaId);
  }

  @Get('rango')
  findByRango(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    return this.ventasService.findByRangoFechas(new Date(inicio), new Date(fin));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.updateVenta(+id, updateVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventasService.removeVenta(+id);
  }

  @Delete('limpiar-antiguas')
  limpiarVentasAntiguas() {
    return this.ventasService.eliminarVentasAntiguas();
  }

  @Get('fecha/:fecha')
  findByFecha(@Param('fecha') fecha: string) {
    return this.ventasService.findByFecha(new Date(fecha));
  }

  @Get('total/dia')
  calcularTotalDelDia(@Query('fecha') fecha: string) {
    return this.ventasService.calcularTotalDelDia(new Date(fecha));
  }
}