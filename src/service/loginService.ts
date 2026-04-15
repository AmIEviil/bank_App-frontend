import apiClient from "../client/client";
import type { Movimiento } from "../components/BancoLogin";

interface IGetDataResponse {
  id: number;
  rut: string;
  movimientos: Movimiento[];
}

export const loginService = {
  login: async (rut: string, password: string) => {
    const response = await apiClient.post("/banco-chile/login", {
      rut,
      password,
    });
    return response.data;
  },

  loginRabbitMQ: async (rut: string, password: string) => {
    const response = await apiClient.post("/api/rabbitmq/enviar", {
      rut,
      password,
    });
    return response.data;
  },

  getData: async (rut: string): Promise<IGetDataResponse> => {
    const response = await apiClient.get(`/api/banco-chile/get-data/${rut}`);
    return response.data;
  },
};
