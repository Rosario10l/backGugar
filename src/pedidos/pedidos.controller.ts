import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /*@Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.createPedido(createPedidoDto);
  }*/

  @Get('all')
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.updatePedido(+id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.pedidosService.removePedido(+id);
  }

    /* @Post(':id/calcular-total')
  calcularTotal(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.calcularTotalPedido(id);
  }*/

     @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoPedidoDto: UpdateEstadoPedidoDto
  ) {
    return this.pedidosService.actualizarEstadoPedido(id, updateEstadoPedidoDto);
  }
}
