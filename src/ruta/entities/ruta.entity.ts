import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { ClienteRuta } from './cliente-ruta.entity'; 

@Entity({ name: 'rutas' })
export class Ruta {

  @PrimaryGeneratedColumn()
  idRuta: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario)
  @JoinColumn({ name: 'idRepartidor' }) 
  repartidor: Usuario;

  // Relación con la tabla intermedia
  @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.ruta)
  rutaClientes: ClienteRuta[];
}