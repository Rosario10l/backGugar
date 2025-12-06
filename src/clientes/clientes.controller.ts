import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) { }

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.createCliente(createClienteDto);
  }

  @Get('agrupados')
  obtenerClientesAgrupados() {
    return this.clientesService.obtenerClientesAgrupados();
  }

  @Get("all")
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('supervisor/:supervisorId')
  obtenerRutasDeSupervisor(@Param('supervisorId', ParseIntPipe) supervisorId: number) {
    return this.clientesService.obtenerRutasDeSupervisor(supervisorId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.updateCliente(+id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.removeCliente(+id);
  }

  //PARA VER PEDIDOS DEL CLIENTE
  @Get(':id/pedidos')
  verPedidos(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.verPedidos(id);
  }


}
