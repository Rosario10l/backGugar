import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn()
        id:number
    
        @Column()
        cantidadGarrafones:number;
        @Column()
        estado:string;
        @Column({ type: 'decimal', precision: 10, scale: 2 })
        total:number;
        @CreateDateColumn()
        fecha:Date;
}
