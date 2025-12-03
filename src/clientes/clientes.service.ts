import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Precio } from 'src/precios/entities/precio.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
  private clienteRepo: Repository<Cliente>,
    @InjectRepository(Precio)
  private precioRepo: Repository<Precio>
  ){ }


async createCliente(createClienteDto: CreateClienteDto) {
    try {
      // 1. Validar Precio
      const precio = await this.precioRepo.findOneBy({ id: createClienteDto.tipoPrecioId });
      if (!precio) throw new BadRequestException('Precio no encontrado');

      // 2. Generar número de cliente (CTE) si no viene
      // Usamos la fecha actual como número único rápido
      const cteGenerado = createClienteDto.cte || Math.floor(Date.now() / 1000);

      // 3. Crear Cliente (Mapeando datos)
      const newCliente = this.clienteRepo.create({
        representante: createClienteDto.nombre, // Mapeamos nombre -> representante
        telefono: createClienteDto.telefono,
        correo: createClienteDto.correo,
        tipoPrecio: precio,
        cte: cteGenerado,
        negocio: createClienteDto.negocio || 'Particular',
        // Dirección
        calle: createClienteDto.calle,
        colonia: createClienteDto.colonia,
        referencia: createClienteDto.referencia,
        latitud: createClienteDto.latitud,
        longitud: createClienteDto.longitud
      });

      return await this.clienteRepo.save(newCliente);

    } catch (error) {
      console.error(error);
      // Manejo de error de duplicados
      if (error.code === 'ER_DUP_ENTRY') {
         throw new BadRequestException('El correo o número de cliente ya existe.');
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }
  async findAll() {
    return this.clienteRepo.find({ relations: ['tipoPrecio'] });
  }

  async findOne(id: number) {
    return this.clienteRepo.findOne({
      where: { id },
      relations: ['tipoPrecio'],
    });
  }

  async updateCliente(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = await this.clienteRepo.findOneBy({ id });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      // Validar Precio si viene en el DTO
      if (updateClienteDto.tipoPrecioId) {
        const precio = await this.precioRepo.findOneBy({
          id: updateClienteDto.tipoPrecioId,
        });
        if (!precio) throw new BadRequestException('Precio no encontrado');
        // Asignamos el objeto precio a la entidad
        cliente.tipoPrecio = precio;
      }

      // Fusionamos los demás datos (calle, colonia, latitud, etc.)
      // El 'merge' toma todo lo que venga en el DTO y lo pone en el cliente
      this.clienteRepo.merge(cliente, updateClienteDto);

      return await this.clienteRepo.save(cliente);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async removeCliente(id: number) {
    try {
      const cliente = await this.clienteRepo.findOneBy({id});
      if(!cliente){
        throw new NotFoundException(`cliente con el id: ${id} no encontrado`);
      }
      await this.clienteRepo.remove(cliente);
      return {message:`cliente con el id: ${id} se ha eliminado`};

    } catch (error){
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }



    // FUNCIÓN VER PEDIDOS DEL CLIENTE
    async verPedidos(clienteId: number) {
        const cliente = await this.clienteRepo.findOne({
            where: { id: clienteId },
            relations: ['pedidos'] // Esto carga los pedidos relacionados
        });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
        }

        return cliente.pedidos;
    }

}
