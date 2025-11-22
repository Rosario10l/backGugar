// src/ruta/entities/dia-ruta.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Ruta } from './ruta.entity';
import { ClienteRuta } from './cliente-ruta.entity';

export enum DiasSemana {
  LUNES_JUEVES = 'Lunes - Jueves',
  MARTES_VIERNES = 'Martes - Viernes',
  MIERCOLES_SABADO = 'Miercoles - Sábado',
}

@Entity({ name: 'dias_ruta' })
export class DiaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // Ej: "Ruta Centro - Lunes - Jueves"

  @Column({
    type: 'enum',
    enum: DiasSemana,
  })
  diaSemana: DiasSemana;

  @CreateDateColumn()
  createdAt: Date;

  // RELACIÓN CON RUTA PADRE
  @ManyToOne(() => Ruta, (ruta) => ruta.diasRuta)
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta;

  // RELACIÓN CON CLIENTES
  @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.diaRuta)
  clienteRutas: ClienteRuta[];
}