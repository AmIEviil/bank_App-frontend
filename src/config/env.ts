const fallbackApiUrl = "http://localhost:3000";

export const envConfig = {
  apiUrl: import.meta.env.VITE_API_URL || fallbackApiUrl,
  socketUrl: import.meta.env.VITE_SOCKET_URL || fallbackApiUrl,
};
