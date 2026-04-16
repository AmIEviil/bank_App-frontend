import apiClient from "../client/client";

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
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

export type DataSourceType = "BANCO_CHILE_CC" | "BANCO_CHILE_TC";

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

  getMyMetrics: async (): Promise<MetricsData> => {
    const response = await apiClient.get(`${API_PREFIX}/transactions/me/metrics`);
    return response.data as MetricsData;
  },

  getMyResumen: async (): Promise<ResumeData> => {
    const response = await apiClient.get(`${API_PREFIX}/transactions/me/resumen`);
    return response.data as ResumeData;
  },

  getMyCreditCardOverview: async (): Promise<CreditCardOverviewData> => {
    const response = await apiClient.get(
      `${API_PREFIX}/transactions/me/credit-card/overview`,
    );
    return response.data as CreditCardOverviewData;
  },
};
