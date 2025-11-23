import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Ruta } from './ruta.entity';
import { ClienteRuta } from './cliente-ruta.entity';

export enum DiasSemana {
  LUNES_JUEVES = 'Lunes - Jueves',
  MARTES_VIERNES = 'Martes - Viernes',
  MIERCOLES_SABADO = 'Miercoles - Sábado'
}

export enum EstadoDiaRuta {
  PENDIENTE = 'pendiente',      // Recién importada, sin asignar
  EN_CURSO = 'en_curso',        // Repartidor trabajando
  PAUSADA = 'pausada',          // Pausa temporal
  COMPLETADA = 'completada'     // Finalizada
}

@Entity('dias_ruta')
export class DiaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: DiasSemana
  })
  diaSemana: DiasSemana;

  @Column({
    type: 'enum',
    enum: EstadoDiaRuta,
    default: EstadoDiaRuta.PENDIENTE
  })
  estado: EstadoDiaRuta;

  // Fechas de control
  @Column({ type: 'date', nullable: true })
  fechaInicio?: Date;

  @Column({ type: 'date', nullable: true })
  fechaFinalizacion?: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relaciones
  @Column()
  ruta_id: number;

  @Column({ nullable: true })
  subRutaLetra?: string; // 'A', 'B', 'C' para dividir
  
  @Column({ default: false })
  esDivision: boolean; // Indica si es una división
  
  @Column({ nullable: true })
  diaRutaPadreId?: number; // Si es división, referencia al original

  @ManyToOne(() => Ruta, (ruta) => ruta.diasRuta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta;

  @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.diaRuta)
  clientesRuta: ClienteRuta[];
}