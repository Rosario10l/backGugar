import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity({ name: 'notificaciones' })
export class Notificacion {

  @PrimaryGeneratedColumn()
  idNotificacion: number;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => Usuario, { eager: true }) 
  @JoinColumn({ name: 'idEmisor' })
  emisor: Usuario;

  @Column() 
  idEmisor: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idReceptor' })
  receptor: Usuario;

  @Column() 
  idReceptor: number;
}