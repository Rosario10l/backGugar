import { Column,Entity, PrimaryGeneratedColumn } from "typeorm"

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
}
