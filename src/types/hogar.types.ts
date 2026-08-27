import type { OperationType } from "../service/loginService";

export type EstadoCuenta = "pendiente" | "pagada" | "vencida";

export interface CuentaHogarItem {
  id: number;
  nombre: string;
  monto: number;
  fechaVencimiento: string | null;
  estado: EstadoCuenta;
  orden: number;
}

export interface CreateCuentaPayload {
  nombre: string;
  monto: number;
  fechaVencimiento?: string | null;
  estado?: EstadoCuenta;
  orden?: number;
}

export type UpdateCuentaPayload = Partial<CreateCuentaPayload>;

export interface HogarConfig {
  ahorroPorcentaje: number;
  personasCount: number;
  personasNombres: string[];
  gastosSemanalesMonto: number | null;
  gastosSemanalesSemanas: number | null;
}

export interface UpsertConfigPayload {
  ahorroPorcentaje?: number;
  personasCount?: number;
  personasNombres?: string[];
  gastosSemanalesMonto?: number | null;
  gastosSemanalesSemanas?: number | null;
}

export interface ReservaRetiroItem {
  id: number;
  reservaId: number;
  reservaNombre: string;
  montoRetiro: number;
  descripcion: string | null;
}

export interface CreateRetiroPayload {
  mes: string;
  reservaId: number;
  montoRetiro: number;
  descripcion?: string | null;
}

export interface MovimientoUsoLibreItem {
  id: number;
  descripcion: string;
  monto: number;
  tipoOperacion: OperationType;
  fecha: string;
}

export interface PersonaUsoLibre {
  index: number;
  nombre: string;
  presupuesto: number;
  movimientos: MovimientoUsoLibreItem[];
  totalGastado: number;
  disponible: number;
}

export interface CreateMovimientoUsoLibrePayload {
  mes: string;
  personaIndex: number;
  descripcion: string;
  monto: number;
  tipoOperacion?: OperationType;
  fecha?: string;
}

export interface HogarResumen {
  mes: string;
  presupuesto: {
    sueldo: number;
    abonoKim: number;
    total: number;
  };
  config: HogarConfig;
  montoTarjeta: number;
  cuentas: CuentaHogarItem[];
  totalCuentas: number;
  retiros: ReservaRetiroItem[];
  totalReservas: number;
  ahorro: number;
  totalGastosSemanales: number;
  usoLibreTotal: number;
  usoLibrePorPersona: number;
  personas: PersonaUsoLibre[];
}

export interface ReservaDisponible {
  id: number;
  nombre: string;
  monto: string;
  comentarios?: string | null;
}
