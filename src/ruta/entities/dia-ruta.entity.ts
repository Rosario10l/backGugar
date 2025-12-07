import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm'; // Cambiamos ManyToMany por OneToMany
import { Ruta } from './ruta.entity';
import { ClienteRuta } from './cliente-ruta.entity'; // <--- IMPORTANTE

export enum EstadoDiaRuta {
  PENDIENTE = 'pendiente',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  PAUSADA = 'pausada',
  CANCELADA = 'cancelada',
}

@Entity()
export class DiaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  diaSemana: string;

  @Column({ default: EstadoDiaRuta.PENDIENTE })
  estado: string;


  @Column({ default: false })
  dividida: boolean;

  @Column({ nullable: true })
  diaRutaPadreId?: number;

  @ManyToOne(() => DiaRuta, { nullable: true })
  diaRutaPadre?: DiaRuta;
  
  @Column({ nullable: true })
  fechaInicio: Date;

  @Column({ nullable: true })
  fechaFinalizacion: Date;

  @ManyToOne(() => Ruta, (ruta) => ruta.diasRuta, { onDelete: 'CASCADE' })
  ruta: Ruta;

  // --- CAMBIO CRÍTICO: Usamos la tabla intermedia de tu compañero ---
  @OneToMany(() => ClienteRuta, (cr) => cr.diaRuta, { cascade: true })
  clientesRuta: ClienteRuta[];
}
