// src/ventas/entities/venta.entity.ts

import { Precio } from "src/precios/entities/precio.entity";
import { ClienteRuta } from "src/ruta/entities/cliente-ruta.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ClienteRuta, { nullable: false ,  onDelete: 'CASCADE'})
  @JoinColumn({ name: 'cliente_ruta_id' })
  clienteRuta: ClienteRuta;

  @Column()
  cantidadVendida: number;

  @ManyToOne(() => Precio, { nullable: false })
  @JoinColumn({ name: 'precio_id' })
  precio: Precio;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['realizado', 'saltado', 'pendiente'],
    default: 'pendiente'
  })
  estado: string;

  @Column({ nullable: true })
  motivoSalto: string;

  @CreateDateColumn()
  fecha: Date;

  // Método para calcular el total automáticamente
  calcularTotal(): void {
    if (this.precio && this.cantidadVendida) {
      this.total = this.cantidadVendida * this.precio.precioPorGarrafon;
    }
  }
}