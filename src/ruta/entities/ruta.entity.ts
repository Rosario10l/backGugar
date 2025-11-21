import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { ClienteRuta } from './cliente-ruta.entity'; 

@Entity()
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  lugarEntrega: string;

  @ManyToOne(() => Usuario, (usuario) => usuario)
  @JoinColumn({ name: 'idRepartidor' }) 
  repartidor: Usuario;

  // Relación con la tabla intermedia
  @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.ruta)
  rutaClientes: ClienteRuta[];
}