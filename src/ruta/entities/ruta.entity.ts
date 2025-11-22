import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { DiaRuta } from './dia-ruta.entity';

@Entity()
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Usuario, (usuario) => usuario)
  @JoinColumn({ name: 'idRepartidor' }) 
  repartidor: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Usuario;



    @OneToMany(() => DiaRuta, (diaRuta) => diaRuta.ruta)
    diasRuta: DiaRuta[];
}