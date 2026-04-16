import axios from "axios";
import { envConfig } from "../config/env";

export const ACCESS_TOKEN_KEY = "bank_app_access_token";

const apiClient = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
