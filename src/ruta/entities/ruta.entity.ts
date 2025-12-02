import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DiaRuta } from './dia-ruta.entity';

@Entity()
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  // --- BORRAMOS LOS CAMPOS VIEJOS (lugarEntrega, cantidad, coordenadas) ---
  // Porque ahora la ruta se define por los clientes que tiene asignados.

  // --- RELACIONES CON PERSONAL ---
  
  // Repartidor
  @Column({ nullable: true })
  idRepartidor: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'idRepartidor' })
  repartidor: Usuario;

  // Supervisor
  @Column({ nullable: true })
  supervisorId: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisorId' })
  supervisor: Usuario;

  // --- RELACIÓN PRINCIPAL (DÍAS) ---
  @OneToMany(() => DiaRuta, (dia) => dia.ruta, { cascade: true })
  diasRuta: DiaRuta[];
}