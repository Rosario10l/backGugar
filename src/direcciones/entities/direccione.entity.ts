import { Cliente } from "src/clientes/entities/cliente.entity"
import { Column,Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Direccione {
       @PrimaryGeneratedColumn()
        id:number
    
        @Column()
        direccion:string
        @Column()
        colonia:string
        @Column()
        codigoPostal:number
        @Column()
        ciudad:string
        @Column()
        latitud:number
        @Column()
        longitud:number

         // RELACIÓN CON CLIENTE
        @ManyToOne(() => Cliente, (cliente) => cliente.direcciones)
        @JoinColumn({ name: 'clienteId' })
         cliente: Cliente;

        @Column()
        clienteId: number;
}
