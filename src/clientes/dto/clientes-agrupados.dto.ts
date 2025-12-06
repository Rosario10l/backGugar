export class ClienteConRutaDto {
  id: number;
  nombre: string;
  negocio: string | null;
  telefono: string;
  cte: number | null;
  correo: string | null;
  calle: string;
  colonia: string;
    referencia: string | null;
    latitud: number | null;
    longitud: number | null;
  tipoPrecio: {
    id: number;
    tipoCompra: string;
    precioPorGarrafon: number;
  } | null;
  ruta: {
    id: number;
    nombre: string;
    numeroRuta: string;
  } | null;
  diaRuta: {
    id: number;
    diaSemana: string;
  } | null;
}

export class RutaConClientesDto {
  id: number;
  nombre: string;
  numeroRuta: string;
  repartidor: {
    id: number;
    nombre: string;
  } | null;
  supervisor: {
    id: number;
    nombre: string;
  } | null;
  diasRuta: {
    id: number;
    diaSemana: string;
    cantidadClientes: number;
    clientes: ClienteConRutaDto[];
  }[];
  totalClientes: number;
}

export class ClientesAgrupadosResponseDto {
  asignados: RutaConClientesDto[];
  noAsignados: ClienteConRutaDto[];
  totalAsignados: number;
  totalNoAsignados: number;
}