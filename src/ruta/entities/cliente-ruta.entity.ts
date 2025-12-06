import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { DiaRuta } from './dia-ruta.entity';
import { Precio } from 'src/precios/entities/precio.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Entity('clientes_rutas')
@Unique(['cliente', 'diaRuta']) // ← Constraint de unicidad
export class ClienteRuta {
  @PrimaryGeneratedColumn()
  id: number;

  // === RELACIONES ===

  @Column()
  cliente_id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.clienteRutas, { eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  dia_ruta_id: number;

  @ManyToOne(() => DiaRuta, (diaRuta) => diaRuta.clientesRuta,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'dia_ruta_id' })
  diaRuta: DiaRuta;

  @Column()
  precio_id: number;

  @ManyToOne(() => Precio, { eager: true })
  @JoinColumn({ name: 'precio_id' })
  precio: Precio;

  // === CAMPOS ADICIONALES ===

  @Column({ type: 'boolean', default: false })
  es_credito: boolean;

  @Column({ type: 'boolean', default: false })
  requiere_factura: boolean;

  @Column({ default: false })
  visitado: boolean;

  @Column({ type: 'int', nullable: true })
  garrafonesVendidos: number;

  @CreateDateColumn()
  created_at: Date;

  // === RELACIÓN CON VENTAS ===

  @OneToMany(() => Venta, (venta) => venta.clienteRuta)
  ventas: Venta[];
}
