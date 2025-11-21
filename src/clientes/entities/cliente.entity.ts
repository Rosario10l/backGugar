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

    @Column()
    nombre: string;

    @Column()
    telefono: string;

    @Column({ unique: true })
    correo: string;

    @Column({ default: false })
    esMayoreo: boolean;
    
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