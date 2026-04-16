export type PublicView = "login" | "forgot" | "reset" | "create-account";

export type PrivateView =
  | "inicio"
  | "movimientos"
  | "tarjeta-credito"
  | "metricas"
  | "resumen"
  | "configuracion";

export type AppView = PublicView | PrivateView;

export type MovementFilter = "all" | "ingreso" | "gasto";

export type MovementSourceFilter = "all" | "cuenta-corriente" | "tarjeta-credito";

export type MovementStatementFilter = "all" | "facturados" | "no-facturados";

export const authViewLabels: Record<PublicView, string> = {
  login: "Login",
  forgot: "Olvide password",
  reset: "Restablecer",
  "create-account": "Crear cuenta",
};

export const privateViewLabels: Record<PrivateView, string> = {
  inicio: "Inicio",
  movimientos: "Movimientos",
  "tarjeta-credito": "Tarjeta credito",
  metricas: "Metricas",
  resumen: "Resumen",
  configuracion: "Configuracion",
};
