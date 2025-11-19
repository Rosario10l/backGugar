import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ruta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  lugarEntrega: string;

  @Column('int')
  cantidad: number;

  @Column({ nullable: true })
  acciones: string;

  // Guardamos las coordenadas como JSON para no complicarnos con tablas extra
  // Si usas Postgres usa 'jsonb', si es MySQL usa 'json' o 'simple-json'
  @Column('simple-json') 
  coordenadas: any[]; 

  // Relación: Una ruta pertenece a Un Repartidor (Usuario)
  @ManyToOne(() => Usuario, (usuario) => usuario.id, { eager: true })
  repartidor: Usuario;
}