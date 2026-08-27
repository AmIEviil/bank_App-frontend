export type PublicView = "login" | "forgot" | "reset" | "create-account";

export type PrivateView =
  | "inicio"
  | "movimientos"
  | "tarjeta-credito"
  | "hogar"
  | "metricas"
  | "resumen"
  | "configuracion"
  | "reservas-mercadopago";

export type AppView = PublicView | PrivateView;

export type MovementFilter = "all" | "ingreso" | "gasto";

export type MovementSourceFilter =
  | "all"
  | "cuenta-corriente"
  | "tarjeta-credito";

export type MovementStatementFilter = "all" | "facturados" | "no-facturados";

export const authViewLabels: Record<PublicView, string> = {
  login: "Ingresar",
  forgot: "Recuperar",
  reset: "Restablecer",
  "create-account": "Registrarse",
};

export const privateViewLabels: Record<PrivateView, string> = {
  inicio: "◈ Inicio",
  movimientos: "↕ Movimientos",
  "tarjeta-credito": "▣ Tarjeta",
  hogar: "⌂ Hogar",
  metricas: "◎ Métricas",
  resumen: "≡ Resumen",
  configuracion: "⚙ Config",
  "reservas-mercadopago": "◇ Reservas MP",
};
