import { Pedido } from 'src/pedidos/entities/pedido.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { ClienteRuta } from 'src/ruta/entities/cliente-ruta.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  representante: string; // En BD se llama representante

  @Column()
  telefono: string;

 @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  correo: string | null;

  @Column({ unique: true, nullable: true })
  cte: number; // Lo haremos opcional o autogenerado

  @Column({ nullable: true })
  negocio: string;

  // --- CAMPOS DE DIRECCIÓN (Los agregamos aquí para facilidad) ---
  @Column()
  calle: string;

  @Column()
  colonia: string;

  @Column({ nullable: true })
  referencia: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;
  // ------------------------------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Precio, (precio) => precio.clientes)
  @JoinColumn({ name: 'tipoPrecioId' })
  tipoPrecio: Precio;
  // RELACIÓN CON PEDIDOS
  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];

  // RELACIÓN CON RUTAS
  @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.cliente)
  clienteRutas: ClienteRuta[];
}