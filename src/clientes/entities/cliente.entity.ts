//cliente.entity.ts

import { Direccione } from "src/direcciones/entities/direccione.entity";
import { Pedido } from "src/pedidos/entities/pedido.entity";
import { ClienteRuta } from "src/ruta/entities/cliente-ruta.entity";
import { Precio } from "src/precios/entities/precio.entity"; // ← AGREGAR IMPORT
import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    // ... (Tus campos de nombre, teléfono, correo, etc. déjalos igual) ...
    @Column()
    representante: string;

    @Column()
    telefono: string;

    @Column({ unique: true })
    cte: number;

    @Column()
    negocio: string;
    
    @CreateDateColumn()
    createdAt: Date;

    // ===== AGREGAR ESTA RELACIÓN =====
    @ManyToOne(() => Precio, (precio) => precio.clientes)
    @JoinColumn({ name: 'tipoPrecioId' })
    tipoPrecio: Precio;
    // =================================

    // RELACIÓN CON PEDIDOS
    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];

    // RELACIÓN CON DIRECCIONES
    @OneToMany(() => Direccione, (direccion) => direccion.cliente)
    direcciones: Direccione[];

    // RELACIÓN CON RUTAS
    @OneToMany(() => ClienteRuta, (clienteRuta) => clienteRuta.cliente)
    clienteRutas: ClienteRuta[];
}