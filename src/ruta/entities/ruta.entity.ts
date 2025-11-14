import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  ManyToMany, 
  JoinTable,
  JoinColumn
} from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
// import { Cliente } from 'src/clientes/entities/cliente.entity'; 

@Entity({ name: 'rutas' })
export class Ruta {

  @PrimaryGeneratedColumn()
  idRuta: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario)// agregar rutas asignadas
  @JoinColumn({ name: 'idRepartidor' }) 
  repartidor: Usuario;

  @Column() 
  idRepartidor: number;

  // @ManyToMany(() => Cliente, (cliente) => cliente.rutas)
  // @JoinTable({
  //   name: 'ruta_cliente', 
  //   joinColumn: { name: 'idRuta' },
  //   inverseJoinColumn: { name: 'idCliente' }
  // })
  // clientes: Cliente[];
}