import { Cliente } from "src/clientes/entities/cliente.entity"
import { Column,Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Direccione {
       @PrimaryGeneratedColumn()
        id:number
    
        @Column()
        calle:string
        @Column()
        numero:number
        @Column()
        colonia:string
        @Column()
        codigoPostal:number
        @Column()
        ciudad:string

         // RELACIÓN CON CLIENTE
        @ManyToOne(() => Cliente, (cliente) => cliente.direcciones)
        @JoinColumn({ name: 'clienteId' })
         cliente: Cliente;

        @Column()
        clienteId: number;
}
