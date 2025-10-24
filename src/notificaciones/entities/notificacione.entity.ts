import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('mensajes')
export class Notificacione {

    @PrimaryGeneratedColumn()
    id: number;
    @Column({type:'text'})
    contenido:string;
    @Column({type:'boolean', default:false})
    leido:boolean;
    @CreateDateColumn({ type: 'timestamp' })
    fecha: Date;
    @ManyToOne(() =>Usuario,{eager:true})
    @JoinColumn({name:'remitenteId'})
    remitente:Usuario;
    @Column()
    remitenteId:number;
    @ManyToOne(() => Usuario, { eager: true })
    @JoinColumn({ name: 'destinatarioId' }) 
    destinatario: Usuario;
    @Column() 
    destinatarioId: number;
}
