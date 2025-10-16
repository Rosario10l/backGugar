import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
        id:number
    
        @Column()
        cantidadGarrafones:number;
        @Column({ default: 'pendiente' })
        estado:string;
        @Column({ type: 'decimal', precision: 10, scale: 2 })
        total:number;
        @CreateDateColumn()
        fecha:Date;

        // Método para calcular el total
    calcularTotal(precioPorGarrafon: number): void {
        this.total = this.cantidadGarrafones * precioPorGarrafon;
    }

    // Método para actualizar estado
    actualizarEstado(nuevoEstado: string): void {
        const estadosValidos = ['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'];
        
        if (estadosValidos.includes(nuevoEstado)) {
            this.estado = nuevoEstado;
        } else {
            throw new Error(`Estado no válido: ${nuevoEstado}`);
        }
    }

    //Hook para calcular automáticamente antes de insertar/actualizar
    @BeforeInsert()
    @BeforeUpdate()
    setDefaultValues() {
        if (!this.estado) {
            this.estado = 'pendiente';
        }
    }
}
