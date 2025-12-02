
import { Cliente } from "src/clientes/entities/cliente.entity";
import { ClienteRuta } from "src/ruta/entities/cliente-ruta.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Precio {
    @PrimaryGeneratedColumn()
        id: number;
    
        @Column()
        tipoCompra: string;
    
        @Column({ type: 'decimal', precision: 10, scale: 2 })
        precioPorGarrafon: number;
    
        

        @OneToMany(() => Cliente, (cliente) => cliente.tipoPrecio)
        clientes: Cliente[];

         @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.precio)
        clientesRutas: ClienteRuta[];
}
