export interface Reserva {
  id: number;
  nombre: string;
  monto: string;
  comentarios?: string | null;
  createdAt: string;
  updatedAt: string;
  fuente?: { id: number; tipo: string; identificador: string };
}
