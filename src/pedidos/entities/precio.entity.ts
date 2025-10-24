import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Precio {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipoCompra: string; // 'mayoreo' o 'menudeo'

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precioPorGarrafon: number;

    @CreateDateColumn()
    fechaVigencia: Date;

    actualizarPrecio(nuevoPrecio: number): void {
        this.precioPorGarrafon = nuevoPrecio;
        this.fechaVigencia = new Date();
    }
}