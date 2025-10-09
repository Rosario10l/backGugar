import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
