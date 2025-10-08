import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    nombre:string
    @Column()
    telefono:number
    @Column({unique: true})
    correo:string

    @Column({
        default: true
    })
    esMayoreo:boolean
    @CreateDateColumn()
    createdAt:Date
}
