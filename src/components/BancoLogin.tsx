import { useEffect, useState } from "react";
import { loginService } from "../service/loginService";
import { io } from "socket.io-client";

export interface Movimiento {
  fecha: string;
  descripcion: string;
  channel: string;
  amount: number;
  balance: number;
}

// Nos conectamos al servidor de NestJS (ajusta el puerto si es necesario)
const socket = io("http://localhost:3000");

export const BancoLogin = () => {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [cargando, setCargando] = useState(false);

  const [data, setData] = useState<Movimiento[]>([]);

  const bancos = [
    { id: "bancoChile", name: "Banco de Chile" },
    { id: "bancoEstado", name: "Banco Estado" },
    { id: "bancoSantander", name: "Banco Santander" },
  ];

  const handleLogin = async () => {
    try {
      setCargando(true);
      const response = await loginService.loginRabbitMQ(rut, password);
      console.log("Login response:", response);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const fetchUserData = async (rut: string) => {
    try {
      const response = await loginService.getData(rut);
      setData(response.movimientos);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!rut) return;

    // Escuchamos el evento específico para este RUT
    const evento = `scraping-terminado-${rut}`;

    socket.on(evento, async (data) => {
      console.log("¡Notificación recibida!", data);
      setCargando(false);
      alert(data.mensaje); // O mostrar un Toast/Modal bonito

      // Aquí podrías hacer un fetch() para traer los datos recién guardados de la BD
      fetchUserData(rut);
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.off(evento);
    };
  }, [rut]);

  return (
    <div className="flex flex-col w-full self-center items-center gap-4 p-4">
      <h1 className="w-full">Banco Login</h1>
      <select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
      >
        <option value="" disabled>
          Seleccione un banco
        </option>
        {bancos.map((banco) => (
          <option
            key={banco.id}
            value={banco.id}
            className="bg-white text-black"
          >
            {banco.name}
          </option>
        ))}
      </select>
      {selectedBank && (
        <div className="flex flex-col gap-4 mt-4">
          <h2>Login para {bancos.find((b) => b.id === selectedBank)?.name}</h2>
          <input
            id="rut-input"
            className="bg-white text-black w-full p-2 border border-gray-300 rounded"
            type="text"
            placeholder="RUT"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
          <input
            id="password-input"
            className="bg-white text-black w-full p-2 border border-gray-300 rounded"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={cargando}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      )}
      {data.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-xl mb-4">Movimientos Bancarios</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Fecha</th>
                <th className="border p-2">Descripción</th>
                <th className="border p-2">Canal</th>
                <th className="border p-2">Monto</th>

                <th className="border p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((movimiento, index) => (
                <tr key={movimiento.fecha + index}>
                  <td className="border p-2">{movimiento.fecha}</td>
                  <td className="border p-2">{movimiento.descripcion}</td>
                  <td className="border p-2">{movimiento.channel}</td>
                  <td className="border p-2">{movimiento.amount}</td>
                  <td className="border p-2">{movimiento.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
