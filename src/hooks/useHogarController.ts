import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginService } from "../service/loginService";
import { useAppStore } from "../store/appStore";
import type {
  CreateCuentaPayload,
  UpdateCuentaPayload,
  UpsertConfigPayload,
  CreateRetiroPayload,
  CreateMovimientoUsoLibrePayload,
} from "../types/hogar.types";

function currentMesDefault(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const RESUMEN_KEY = (mes: string) => ["hogar", "resumen", mes];
const RESERVAS_KEY = ["hogar", "reservas-disponibles"];

export function useHogarController() {
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const qc = useQueryClient();
  const [mes, setMes] = useState(currentMesDefault);

  const resumenQuery = useQuery({
    queryKey: RESUMEN_KEY(mes),
    queryFn: () => loginService.getHogarResumen(mes),
    staleTime: 1000 * 30,
  });

  const reservasQuery = useQuery({
    queryKey: RESERVAS_KEY,
    queryFn: loginService.getReservasDisponibles,
    staleTime: 1000 * 60 * 5,
  });

  const invalidateResumen = () =>
    void qc.invalidateQueries({ queryKey: RESUMEN_KEY(mes) });

  const upsertConfigMutation = useMutation({
    mutationFn: (dto: UpsertConfigPayload) =>
      loginService.upsertHogarConfig(mes, dto),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Configuración guardada", "success");
    },
    onError: () => showSnackbar("Error al guardar configuración", "error"),
  });

  const createCuentaMutation = useMutation({
    mutationFn: (dto: CreateCuentaPayload) =>
      loginService.createHogarCuenta(dto),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Cuenta creada", "success");
    },
    onError: () => showSnackbar("Error al crear cuenta", "error"),
  });

  const updateCuentaMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCuentaPayload }) =>
      loginService.updateHogarCuenta(id, dto),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Cuenta actualizada", "success");
    },
    onError: () => showSnackbar("Error al actualizar cuenta", "error"),
  });

  const deleteCuentaMutation = useMutation({
    mutationFn: (id: number) => loginService.deleteHogarCuenta(id),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Cuenta eliminada", "success");
    },
    onError: () => showSnackbar("Error al eliminar cuenta", "error"),
  });

  const createRetiroMutation = useMutation({
    mutationFn: (dto: CreateRetiroPayload) =>
      loginService.createReservaRetiro(dto),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Retiro registrado", "success");
    },
    onError: () => showSnackbar("Error al registrar retiro", "error"),
  });

  const deleteRetiroMutation = useMutation({
    mutationFn: (id: number) => loginService.deleteReservaRetiro(id),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Retiro eliminado", "success");
    },
    onError: () => showSnackbar("Error al eliminar retiro", "error"),
  });

  const createMovimientoMutation = useMutation({
    mutationFn: (dto: CreateMovimientoUsoLibrePayload) =>
      loginService.createMovimientoUsoLibre(dto),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Movimiento registrado", "success");
    },
    onError: () => showSnackbar("Error al registrar movimiento", "error"),
  });

  const deleteMovimientoMutation = useMutation({
    mutationFn: (id: number) => loginService.deleteMovimientoUsoLibre(id),
    onSuccess: () => {
      invalidateResumen();
      showSnackbar("Movimiento eliminado", "success");
    },
    onError: () => showSnackbar("Error al eliminar movimiento", "error"),
  });

  function navMes(dir: -1 | 1) {
    const [y, m] = mes.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMes(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  return {
    mes,
    setMes,
    navMes,
    resumen: resumenQuery.data ?? null,
    resumenLoading: resumenQuery.isLoading,
    reservasDisponibles: reservasQuery.data ?? [],
    upsertConfig: upsertConfigMutation.mutate,
    upsertConfigLoading: upsertConfigMutation.isPending,
    createCuenta: createCuentaMutation.mutate,
    createCuentaLoading: createCuentaMutation.isPending,
    updateCuenta: updateCuentaMutation.mutate,
    deleteCuenta: deleteCuentaMutation.mutate,
    createRetiro: createRetiroMutation.mutate,
    deleteRetiro: deleteRetiroMutation.mutate,
    createMovimiento: createMovimientoMutation.mutate,
    createMovimientoLoading: createMovimientoMutation.isPending,
    deleteMovimiento: deleteMovimientoMutation.mutate,
  };
}
