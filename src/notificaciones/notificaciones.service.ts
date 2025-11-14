import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacione.entity';
import { CreateNotificacionDto } from './dto/create-notificacione.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class NotificacionesService {

  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) {}

 
  async create(
    createDto: CreateNotificacionDto, 
    emisor: Usuario
  ): Promise<Notificacion> {
    
    const nuevaNotificacion = this.notificacionRepository.create({
      ...createDto,
      idEmisor: emisor.id, 
    });

    return this.notificacionRepository.save(nuevaNotificacion);
  }

  async findAllForUser(idUsuario: number): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { idReceptor: idUsuario },
      relations: ['emisor'], 
      order: { fecha: 'DESC' }, 
    });
  }

  
  async findOne(idNotificacion: number, idUsuario: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { idNotificacion },
      relations: ['emisor', 'receptor'],
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.idEmisor !== idUsuario && notificacion.idReceptor !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para ver esta notificación');
    }

    return notificacion;
  }


  async markAsRead(idNotificacion: number, idUsuario: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { idNotificacion }
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.idReceptor !== idUsuario) {
      throw new ForbiddenException('No puedes marcar esta notificación como leída');
    }

    notificacion.leido = true;
    return this.notificacionRepository.save(notificacion);
  }
}