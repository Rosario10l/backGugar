import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DiaRuta } from './dia-ruta.entity';

export enum EstadoRuta {
  IMPORTADA = 'importada',
  ASIGNADA = 'asignada',
  ACTIVA = 'activa',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

@Entity('ruta')
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // @Column({
  //   type: 'enum',
  //   enum: EstadoRuta,
  //   default: EstadoRuta.IMPORTADA
  // })
  // estado: EstadoRuta;

  // // Metadatos de importación
  // @Column({ type: 'varchar', length: 255, nullable: true })
  // fechaReporte?: string; // Fecha del Excel

  // @Column({ type: 'varchar', length: 255, nullable: true })
  // importadoPor?: string; // Usuario que importó

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // fechaImportacion: Date;

  // Relaciones
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'idRepartidor' })
  repartidor?: Usuario;
  @OneToMany(() => DiaRuta, (diaRuta) => diaRuta.ruta, { cascade: true })
  diasRuta: DiaRuta[];
  @Column({ name: 'supervisor_id', nullable: true }) // Forzamos el nombre en BD
  supervisorId: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' }) // Coincide con la columna
  supervisor: Usuario;
}
