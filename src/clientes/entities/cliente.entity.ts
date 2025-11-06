import { Direccione } from "src/direcciones/entities/direccione.entity";
import { Pedido } from "src/pedidos/entities/pedido.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    nombre:string
    @Column()
    telefono:string
    @Column({unique: true})
    correo:string

    @Column({
        default: false
    })
    esMayoreo:boolean
    
    @CreateDateColumn()
    createdAt:Date

    //RELACIÓN CON PEDIDOS
    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];

    //RELACIÓN CON DIRECCIONES
    @OneToMany(() => Direccione, (direccion) => direccion.cliente)
    direcciones: Direccione[];
}
