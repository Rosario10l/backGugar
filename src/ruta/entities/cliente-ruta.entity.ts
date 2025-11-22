import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique
} from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Ruta } from 'src/ruta/entities/ruta.entity';
import { DiaRuta } from './dia-ruta.entity';
import { Precio } from 'src/precios/entities/precio.entity';

// Definimos un Enum para limitar los valores de días (como en tu SQL)
export enum DiasSemana {
  LUNES_JUEVES = 'Lunes - Jueves',
  MARTES_VIERNES = 'Martes - Viernes',
  MIERCOLES_SABADO = 'Miercoles - Sábado',
}

@Entity({ name: 'clientes_rutas' })
@Unique(['cliente', 'diaRuta']) // Esto evita duplicados (UNIQUE KEY unique_cliente_ruta)
export class ClienteRuta {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Precio, (precio) => precio.clientesRutas, { nullable: false })
  @JoinColumn({ name: 'precio_id' }) // Esto crea la columna precio_id en la BD
  precio: Precio;

  // @Column({
  //   name: 'dia_semana',
  //   type: 'enum',
  //   enum: DiasSemana,
  // })
  // diaSemana: DiasSemana;

  @Column({ name: 'es_credito', type: 'boolean', default: false })
  esCredito: boolean;

  @Column({ name: 'requiere_factura', type: 'boolean', default: false })
  requiereFactura: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- RELACIONES (FOREIGN KEYS) ---

  @ManyToOne(() => Cliente, (cliente) => cliente.clienteRutas)
  @JoinColumn({ name: 'cliente_id' }) // Esto crea la columna cliente_id en la BD
  cliente: Cliente;

  // @ManyToOne(() => Ruta, (ruta) => ruta.rutaClientes)
  // @JoinColumn({ name: 'ruta_id' }) // Esto crea la columna ruta_id en la BD
  // ruta: Ruta;

  @ManyToOne(() => DiaRuta, (diaRuta) => diaRuta.clienteRutas)
  @JoinColumn({ name: 'dia_ruta_id' })
  diaRuta: DiaRuta;


}