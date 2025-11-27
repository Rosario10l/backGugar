
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Precio {
    @PrimaryGeneratedColumn()
        id: number;
    
        @Column()
        tipoCompra: string;
    
        @Column({ type: 'decimal', precision: 10, scale: 2 })
        precioPorGarrafon: number;
    
        

        // RELACIÓN CON CLIENTES
        @OneToMany(() => Cliente, (cliente) => cliente.tipoPrecio)
        clientes: Cliente[];
}
