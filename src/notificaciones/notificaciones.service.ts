import { Injectable } from '@nestjs/common';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacione } from './entities/notificacione.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class NotificacionesService {

  constructor(
    @InjectRepository(Notificacione)
    private readonly notificaionesRepository: Repository<Notificacione>,
  ) {}

async  create(createNotificacioneDto: CreateNotificacioneDto,remitente:Usuario):Promise<Notificacione> {
  const{contenido,remitenteId}=createNotificacioneDto;
  const nuevoMensaje = this.notificaionesRepository.create({contenido,remitente,remitenteId:remitente.id});

    return this.notificaionesRepository.save(nuevoMensaje);
  }

  findAll() {
    return `This action returns all notificaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notificacione`;
  }

  update(id: number, updateNotificacioneDto: UpdateNotificacioneDto) {
    return `This action updates a #${id} notificacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }
}
