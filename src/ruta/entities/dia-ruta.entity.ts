import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Ruta } from './ruta.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Entity()
export class DiaRuta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  diaSemana: string; // "Lunes - Jueves", "Martes", etc.

  // RELACIÓN: Un día pertenece a una Ruta Padre
  @ManyToOne(() => Ruta, (ruta) => ruta.diasRuta, { onDelete: 'CASCADE' })
  ruta: Ruta;

  // --- NUEVO CAMPO: ESTADO REAL ---
  // Valores: 'pendiente', 'en_curso', 'completada', 'pausada'
  @Column({ default: 'pendiente' })
  estado: string;
  // RELACIÓN: Un día tiene MUCHOS clientes
  @ManyToMany(() => Cliente)
  @JoinTable() // Esto crea la tabla intermedia automática
  clientes: Cliente[];
}
