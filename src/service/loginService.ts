import apiClient from "../client/client";
import type { Reserva } from "../types/reserva.types";
import type {
  HogarResumen,
  CuentaHogarItem,
  CreateCuentaPayload,
  UpdateCuentaPayload,
  UpsertConfigPayload,
  HogarConfig,
  ReservaRetiroItem,
  CreateRetiroPayload,
  CreateMovimientoUsoLibrePayload,
  MovimientoUsoLibreItem,
  ReservaDisponible,
} from "../types/hogar.types";

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  rutPendiente: boolean;
  googleLinked: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

interface GoogleAuthUrlResponse {
  url: string;
}

export interface Movimiento {
  fecha: string;
  descripcion: string;
  channel: string;
  amount: number;
  balance: number;
}

export interface IGetDataResponse {
  id: number;
  rut: string;
  movimientos: Movimiento[];
}

export type OperationType = "INGRESO" | "GASTO";

export type DataSourceType = "BANCO_CHILE_CC" | "BANCO_CHILE_TC" | "GMAIL" | "MERCADO_PAGO";

export type TipoTarjeta = "credito" | "debito";

export interface DataSourceItem {
  id: number;
  tipo: DataSourceType;
  identificador: string;
  estado: string;
  createdAt: string;
}

export interface TarjetaBancaria {
  id: number;
  nombre: string;
  nroTarjeta: string;
  tipoTarjeta: TipoTarjeta;
  dataSourceId?: number | null;
  dataSource?: DataSourceItem | null;
  montoTotal?: number | null;
  montoUtilizado?: number | null;
  fechaFacturacion?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTarjetaDto {
  nombre: string;
  nroTarjeta: string;
  tipoTarjeta: TipoTarjeta;
  dataSourceId?: number | null;
  montoTotal?: number | null;
  montoUtilizado?: number | null;
  fechaFacturacion?: number | null;
}

export type UpdateTarjetaPayload = Partial<CreateTarjetaDto>;

export interface TransactionRawData {
  fecha?: string;
  date?: string;
  descripcion?: string;
  description?: string;
  statementType?: string;
  scope?: string;
  recordType?: string;
  sourceType?: DataSourceType;
  interface?: string;
  [key: string]: unknown;
}

export interface TransactionItem {
  id: number;
  fecha: string;
  nombreComercio: string;
  monto: string;
  tipoOperacion: OperationType;
  categoria?: { nombre: string } | null;
  fuente?: { identificador: string; tipo: DataSourceType } | null;
  rawData?: TransactionRawData | null;
  comentarios?: string | null;
}

export interface UpdateTransactionDto {
  comentarios?: string | null;
  categoriaId?: number | null;
}

export interface MetricsData {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  cantidadMovimientos: number;
  ticketPromedio: number;
  gastoMensualPromedio: number;
}

export interface ResumeData {
  byCategory: Array<{ label: string; amount: number }>;
  bySource: Array<{ label: string; amount: number }>;
  recent: Array<{
    id: number;
    fecha: string;
    nombreComercio: string;
    tipoOperacion: OperationType;
    monto: number;
    categoria: string;
    fuente: string;
  }>;
}

export type CreditCardScope = "nacional" | "internacional";

export type CreditCardCurrency = "CLP" | "USD";

export interface CreditCardScopeSummary {
  scope: CreditCardScope;
  currency: CreditCardCurrency;
  billedCurrentMonth: number;
  paymentsCurrentMonth: number;
  pendingNoFacturado: number;
  netBilledCurrentMonth: number;
  billingDate: string;
  payUntil: string;
  minimumPayment: number;
}

export interface CreditCardProjectionItem {
  month: string;
  scope: CreditCardScope;
  currency: CreditCardCurrency;
  projectedCharge: number;
}

export interface CreditCardRecentPayment {
  id: number;
  fecha: string;
  descripcion: string;
  montoPago: number;
  currency: CreditCardCurrency;
  scope: CreditCardScope;
  statementType: string;
}

export interface CreditCardOverviewData {
  currentMonth: string;
  summaries: CreditCardScopeSummary[];
  projections: CreditCardProjectionItem[];
  recentPayments: CreditCardRecentPayment[];
}

/* ── Proyección de facturación ──────────────────────────── */

export type ProjectionOrigin = "crawler" | "manual";

export type CargoProgramadoTipo = "CUOTA" | "RECURRENTE" | "AJUSTE";

export interface ProjectionMovement {
  id: string;
  descripcion: string;
  /** Con signo: negativo en reembolsos de terceros y prepagos. */
  amount: number;
  currency: CreditCardCurrency;
  scope: CreditCardScope;
  cuotaLabel: string;
  origen: ProjectionOrigin;
  tipo: CargoProgramadoTipo;
  duplicado: boolean;
  notas: string;
}

export interface ProjectionMonth {
  month: string;
  totalCLP: number;
  totalUSD: number;
  /** totalCLP + totalUSD convertido con el tipo de cambio vigente. */
  totalCLPConvertido: number;
  totalCuotasCLP: number;
  totalRecurrentesCLP: number;
  totalAjustesCLP: number;
  movements: ProjectionMovement[];
}

export interface ProjectionTipoCambio {
  disponible: boolean;
  codigo: string;
  nombre: string;
  valor: number;
  fecha: string;
}

export interface CreditCardProjectionData {
  currentMonth: string;
  horizon: number;
  months: ProjectionMonth[];
  tipoCambio: ProjectionTipoCambio;
  totals: {
    horizonTotalCLP: number;
    horizonTotalUSD: number;
    horizonTotalCLPConvertido: number;
    promedioMensualCLP: number;
  };
}

/* ── Indicadores económicos (mindicador.cl) ─────────────── */

export type IndicadorCodigo = "uf" | "dolar" | "euro" | "utm" | "ipc" | "tpm";

export interface IndicadorEconomico {
  codigo: string;
  nombre: string;
  unidadMedida: string;
  /** Día del valor, formato YYYY-MM-DD. */
  fecha: string;
  valor: number;
}

export interface SyncIndicadoresResult {
  sincronizados: number;
  codigos: string[];
  ejecutadoEn: string;
}

export interface CargoProgramado {
  id: number;
  nombre: string;
  montoCuota: string;
  cuotaActual: number;
  cantCuotas: number;
  mesReferencia: string;
  tipo: CargoProgramadoTipo;
  moneda: CreditCardCurrency;
  activo: boolean;
  notas?: string | null;
  tarjetaId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCargoProgramadoDto {
  nombre: string;
  montoCuota: number;
  tipo: CargoProgramadoTipo;
  mesReferencia: string;
  cuotaActual?: number;
  cantCuotas?: number;
  moneda?: CreditCardCurrency;
  tarjetaId?: number | null;
  activo?: boolean;
  notas?: string | null;
}

export type UpdateCargoProgramadoDto = Partial<CreateCargoProgramadoDto>;

const API_PREFIX = "/api";

export const loginService = {
  register: async (payload: {
    nombre: string;
    apellido: string;
    email: string;
    rut: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/register`, payload);
    return response.data as AuthResponse;
  },

  authLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/login`, {
      email,
      password,
    });
    return response.data as AuthResponse;
  },

  getGoogleAuthUrl: async (state: string): Promise<string> => {
    const response = await apiClient.get(`${API_PREFIX}/auth/google/url`, {
      params: { state },
    });
    const data = response.data as GoogleAuthUrlResponse;
    return data.url;
  },

  exchangeGoogleCode: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/google/exchange`, {
      code,
    });
    return response.data as AuthResponse;
  },

  getGoogleLinkAuthUrl: async (state: string): Promise<string> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/google/link/url`, {
      state,
    });
    const data = response.data as GoogleAuthUrlResponse;
    return data.url;
  },

  exchangeGoogleLinkCode: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post(
      `${API_PREFIX}/auth/google/link/exchange`,
      {
        code,
      },
    );
    return response.data as AuthResponse;
  },

  completeGoogleRut: async (rut: string): Promise<AuthResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/google/complete-rut`, {
      rut,
    });
    return response.data as AuthResponse;
  },

  forgotPassword: async (email: string): Promise<{ message: string; resetToken?: string; expiresAt?: string }> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/forgot-password`, {
      email,
    });
    return response.data as { message: string; resetToken?: string; expiresAt?: string };
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<{ message: string; success: boolean }> => {
    const response = await apiClient.post(`${API_PREFIX}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data as { message: string; success: boolean };
  },

  loginRabbitMQ: async (rut: string, password: string) => {
    const response = await apiClient.post(`${API_PREFIX}/rabbitmq/enviar`, {
      rut,
      password,
    });
    return response.data;
  },

  getData: async (rut: string): Promise<IGetDataResponse> => {
    const response = await apiClient.get(
      `${API_PREFIX}/banco-chile/get-data/${encodeURIComponent(rut)}`,
    );
    return response.data as IGetDataResponse;
  },

  getMyTransactions: async (): Promise<TransactionItem[]> => {
    const response = await apiClient.get(`${API_PREFIX}/transactions/me`);
    return response.data as TransactionItem[];
  },

  getMyMetrics: async (month?: string): Promise<MetricsData> => {
    const response = await apiClient.get(`${API_PREFIX}/transactions/me/metrics`, {
      params: { month },
    });
    return response.data as MetricsData;
  },

  getMyResumen: async (month?: string): Promise<ResumeData> => {
    const response = await apiClient.get(`${API_PREFIX}/transactions/me/resumen`, {
      params: { month },
    });
    return response.data as ResumeData;
  },

  getMyCreditCardOverview: async (): Promise<CreditCardOverviewData> => {
    const response = await apiClient.get(
      `${API_PREFIX}/transactions/me/credit-card/overview`,
    );
    return response.data as CreditCardOverviewData;
  },

  getMyCreditCardProjection: async (
    months: number,
  ): Promise<CreditCardProjectionData> => {
    const response = await apiClient.get(
      `${API_PREFIX}/transactions/me/credit-card/projection`,
      { params: { months } },
    );
    return response.data as CreditCardProjectionData;
  },

  getIndicadores: async (): Promise<IndicadorEconomico[]> => {
    const response = await apiClient.get(`${API_PREFIX}/indicadores`);
    return response.data as IndicadorEconomico[];
  },

  getIndicadorHistorico: async (
    codigo: IndicadorCodigo,
    desde?: string,
    hasta?: string,
  ): Promise<IndicadorEconomico[]> => {
    const response = await apiClient.get(
      `${API_PREFIX}/indicadores/${codigo}`,
      { params: desde && hasta ? { desde, hasta } : undefined },
    );
    return response.data as IndicadorEconomico[];
  },

  syncIndicadores: async (): Promise<SyncIndicadoresResult> => {
    const response = await apiClient.post(`${API_PREFIX}/indicadores/sync`);
    return response.data as SyncIndicadoresResult;
  },

  getMyCargosProgramados: async (): Promise<CargoProgramado[]> => {
    const response = await apiClient.get(`${API_PREFIX}/cargos-programados/me`);
    return response.data as CargoProgramado[];
  },

  createCargoProgramado: async (
    dto: CreateCargoProgramadoDto,
  ): Promise<CargoProgramado> => {
    const response = await apiClient.post(
      `${API_PREFIX}/cargos-programados/me`,
      dto,
    );
    return response.data as CargoProgramado;
  },

  updateCargoProgramado: async (
    id: number,
    dto: UpdateCargoProgramadoDto,
  ): Promise<CargoProgramado> => {
    const response = await apiClient.patch(
      `${API_PREFIX}/cargos-programados/me/${id}`,
      dto,
    );
    return response.data as CargoProgramado;
  },

  deleteCargoProgramado: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete(
      `${API_PREFIX}/cargos-programados/me/${id}`,
    );
    return response.data as { deleted: boolean };
  },

  updateTransaction: async (
    id: number,
    dto: UpdateTransactionDto,
  ): Promise<TransactionItem> => {
    const response = await apiClient.patch(
      `${API_PREFIX}/transactions/${id}`,
      dto,
    );
    return response.data as TransactionItem;
  },

  categorizeTransactionWithAi: async (id: number): Promise<TransactionItem> => {
    const response = await apiClient.patch(
      `${API_PREFIX}/transactions/${id}/categorize-ai`,
    );
    return response.data as TransactionItem;
  },

  getMyDataSources: async (): Promise<DataSourceItem[]> => {
    const response = await apiClient.get(`${API_PREFIX}/data-sources/me`);
    return response.data as DataSourceItem[];
  },

  getMyTarjetas: async (): Promise<TarjetaBancaria[]> => {
    const response = await apiClient.get(`${API_PREFIX}/tarjetas/me`);
    return response.data as TarjetaBancaria[];
  },

  createTarjeta: async (dto: CreateTarjetaDto): Promise<TarjetaBancaria> => {
    const response = await apiClient.post(`${API_PREFIX}/tarjetas/me`, dto);
    return response.data as TarjetaBancaria;
  },

  updateTarjeta: async (id: number, dto: UpdateTarjetaPayload): Promise<TarjetaBancaria> => {
    const response = await apiClient.patch(`${API_PREFIX}/tarjetas/me/${id}`, dto);
    return response.data as TarjetaBancaria;
  },

  deleteTarjeta: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete(`${API_PREFIX}/tarjetas/me/${id}`);
    return response.data as { deleted: boolean };
  },

  getMisReservas: async (): Promise<Reserva[]> => {
    const response = await apiClient.get(`${API_PREFIX}/mercado-pago/mis-reservas`);
    return response.data as Reserva[];
  },

  triggerMercadoPagoSync: async (email: string, password: string): Promise<void> => {
    await apiClient.post(`${API_PREFIX}/mercado-pago/sync`, { email, password });
  },

  completeMfa: async (sessionId: string): Promise<void> => {
    await apiClient.post(`${API_PREFIX}/mercado-pago/mfa-continue/${sessionId}`);
  },

  getHogarResumen: async (mes: string): Promise<HogarResumen> => {
    const response = await apiClient.get(`${API_PREFIX}/hogar/resumen`, { params: { mes } });
    return response.data as HogarResumen;
  },

  upsertHogarConfig: async (mes: string, dto: UpsertConfigPayload): Promise<HogarConfig> => {
    const response = await apiClient.put(`${API_PREFIX}/hogar/config`, dto, { params: { mes } });
    return response.data as HogarConfig;
  },

  getHogarCuentas: async (): Promise<CuentaHogarItem[]> => {
    const response = await apiClient.get(`${API_PREFIX}/hogar/cuentas`);
    return response.data as CuentaHogarItem[];
  },

  createHogarCuenta: async (dto: CreateCuentaPayload): Promise<CuentaHogarItem> => {
    const response = await apiClient.post(`${API_PREFIX}/hogar/cuentas`, dto);
    return response.data as CuentaHogarItem;
  },

  updateHogarCuenta: async (id: number, dto: UpdateCuentaPayload): Promise<CuentaHogarItem> => {
    const response = await apiClient.patch(`${API_PREFIX}/hogar/cuentas/${id}`, dto);
    return response.data as CuentaHogarItem;
  },

  deleteHogarCuenta: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/hogar/cuentas/${id}`);
  },

  getReservasDisponibles: async (): Promise<ReservaDisponible[]> => {
    const response = await apiClient.get(`${API_PREFIX}/hogar/reservas-disponibles`);
    return response.data as ReservaDisponible[];
  },

  createReservaRetiro: async (dto: CreateRetiroPayload): Promise<ReservaRetiroItem> => {
    const response = await apiClient.post(`${API_PREFIX}/hogar/reserva-retiros`, dto);
    return response.data as ReservaRetiroItem;
  },

  deleteReservaRetiro: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/hogar/reserva-retiros/${id}`);
  },

  createMovimientoUsoLibre: async (dto: CreateMovimientoUsoLibrePayload): Promise<MovimientoUsoLibreItem> => {
    const response = await apiClient.post(`${API_PREFIX}/hogar/uso-libre`, dto);
    return response.data as MovimientoUsoLibreItem;
  },

  deleteMovimientoUsoLibre: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/hogar/uso-libre/${id}`);
  },
};
