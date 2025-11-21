import { Direccione } from "src/direcciones/entities/direccione.entity";
import { Pedido } from "src/pedidos/entities/pedido.entity";
import { Precio } from "src/precios/entities/precio.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    nombre:string
    @Column()
    telefono:string
    @Column()
    cte:number
    @Column()
    negocio:string

    @Column()
    tipoPrecioId: number;
    
    @CreateDateColumn()
    createdAt:Date

        //RELACIÓN CON PRECIO
    @ManyToOne(() => Precio, (precio) => precio.clientes)
    @JoinColumn({ name: 'tipoPrecioId' })
    tipoPrecio: Precio;

    //RELACIÓN CON PEDIDOS
    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];

    //RELACIÓN CON DIRECCIONES
    @OneToMany(() => Direccione, (direccion) => direccion.cliente)
    direcciones: Direccione[];
}
