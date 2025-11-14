import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacione.dto';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('notificaciones')
@UseGuards(AuthGuard()) 
export class NotificacionesController {
  
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  create(
    @Body() createNotificacionDto: CreateNotificacionDto,
    @Req() req: any, 
  ) {
    const emisor = req.user; 
    return this.notificacionesService.create(createNotificacionDto, emisor);
  }


  @Get('mis-notificaciones')
  findAll(@Req() req: any) {
    const idUsuario = req.user.id; 
    return this.notificacionesService.findAllForUser(idUsuario);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    const idUsuario = req.user.id;
    return this.notificacionesService.findOne(id, idUsuario);
  }


  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ) {
    const idUsuario = req.user.id;
    return this.notificacionesService.markAsRead(id, idUsuario);
  }
}