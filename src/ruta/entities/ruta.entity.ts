import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DiaRuta } from './dia-ruta.entity';

export enum EstadoRuta {
  IMPORTADA = 'importada',      // Recién importada del Excel
  ASIGNADA = 'asignada',        // Ya tiene supervisor/repartidor
  ACTIVA = 'activa',            // En operación
  FINALIZADA = 'finalizada',    // Completada
  CANCELADA = 'cancelada'       // Cancelada
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

  // Supervisor y repartidor ahora son OPCIONALES (nullable)
  @Column({ nullable: true })
  idRepartidor?: number;

  @Column({ nullable: true })
  supervisor_id?: number;

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

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor?: Usuario;

  @OneToMany(() => DiaRuta, (diaRuta) => diaRuta.ruta, { cascade: true })
  diasRuta: DiaRuta[];
}