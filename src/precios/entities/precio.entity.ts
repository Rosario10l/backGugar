
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Precio {
    @PrimaryGeneratedColumn()
        id: number;
    
        @Column()
        tipoCompra: string; // 'mayoreo' o 'menudeo'
    
        @Column({ type: 'decimal', precision: 10, scale: 2 })
        precioPorGarrafon: number;
    
        @CreateDateColumn()
        fechaVigencia: Date;
}
