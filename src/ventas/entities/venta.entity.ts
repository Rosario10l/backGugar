import { Precio } from "src/precios/entities/precio.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Venta {
     @PrimaryGeneratedColumn()
    id: number;

     // RELACIÓN CORRECTA CON CLIENTE_RUTA
   /* @ManyToOne(() => ClienteRuta)
    @JoinColumn({ name: 'clienteRutaId' })
    clienteRuta: ClienteRuta;  */

    @Column()
    clienteRutaId: number;

    @Column()
    cantidadVendida: number;

    // ELACIÓN CON PRECIO
    @ManyToOne(() => Precio)
    @JoinColumn({ name: 'precioId' })
    precio: Precio;

    @Column()
    precioId: number;

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
