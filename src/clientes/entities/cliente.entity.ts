import { Precio } from "src/precios/entities/precio.entity";
import { Pedido } from "src/pedidos/entities/pedido.entity"; // <--- IMPORTANTE IMPORTAR ESTO
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    // ... (Tus campos de nombre, teléfono, correo, etc. déjalos igual) ...
    @Column()
    nombre: string;
    @Column()
    telefono: string;
    @Column({ unique: true })
    correo: string;

    // ... (Tus campos nuevos de domicilio y coordenadas déjalos igual) ...
    @Column()
    calle: string;
    @Column()
    colonia: string;
    @Column({ nullable: true })
    referencia: string;
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitud: number;
    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitud: number;

    @CreateDateColumn()
    createdAt: Date;

    // --- RELACIONES ---

    // 1. PRECIO (Esta ya estaba bien)
    @Column()
    tipoPrecioId: number;
    @ManyToOne(() => Precio, (precio) => precio.clientes)
    @JoinColumn({ name: 'tipoPrecioId' })
    tipoPrecio: Precio;

    // 2. PEDIDOS (¡ESTA ES LA QUE FALTABA! AGRÉGALA DE NUEVO) ✅
    // Necesaria para que funcione clientes.service.ts y pedido.entity.ts
    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];
}