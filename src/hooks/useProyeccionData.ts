import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginService } from "../service/loginService";
import type {
  CreateCargoProgramadoDto,
  CreditCardProjectionData,
  UpdateCargoProgramadoDto,
} from "../service/loginService";
import { useAppStore } from "../store/appStore";

export const PROJECTION_HORIZONS = [3, 6, 12] as const;

export type ProjectionHorizon = (typeof PROJECTION_HORIZONS)[number];

const EMPTY_PROJECTION: CreditCardProjectionData = {
  currentMonth: "",
  horizon: 0,
  months: [],
  tipoCambio: {
    disponible: false,
    codigo: "dolar",
    nombre: "Dólar observado",
    valor: 0,
    fecha: "",
  },
  totals: {
    horizonTotalCLP: 0,
    horizonTotalUSD: 0,
    horizonTotalCLPConvertido: 0,
    promedioMensualCLP: 0,
  },
};

const CARGOS_KEY = ["cargos-programados", "me"];

export function useProyeccionData(defaultHorizon: ProjectionHorizon = 6) {
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const token = useAppStore((s) => s.token);
  const qc = useQueryClient();

  const [horizon, setHorizon] = useState<ProjectionHorizon>(defaultHorizon);

  const projectionQuery = useQuery({
    queryKey: ["credit-card-projection", token, horizon],
    queryFn: () => loginService.getMyCreditCardProjection(horizon),
    enabled: Boolean(token),
    staleTime: 30_000,
  });

  const cargosQuery = useQuery({
    queryKey: CARGOS_KEY,
    queryFn: loginService.getMyCargosProgramados,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: CARGOS_KEY });
    void qc.invalidateQueries({ queryKey: ["credit-card-projection", token] });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateCargoProgramadoDto) =>
      loginService.createCargoProgramado(dto),
    onSuccess: () => {
      invalidate();
      showSnackbar("Cargo programado guardado", "success");
    },
    onError: () => showSnackbar("No se pudo guardar el cargo", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCargoProgramadoDto }) =>
      loginService.updateCargoProgramado(id, dto),
    onSuccess: () => {
      invalidate();
      showSnackbar("Cargo programado actualizado", "success");
    },
    onError: () => showSnackbar("No se pudo actualizar el cargo", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => loginService.deleteCargoProgramado(id),
    onSuccess: () => {
      invalidate();
      showSnackbar("Cargo programado eliminado", "success");
    },
    onError: () => showSnackbar("No se pudo eliminar el cargo", "error"),
  });

  return {
    horizon,
    setHorizon,
    projection: projectionQuery.data ?? EMPTY_PROJECTION,
    projectionLoading: projectionQuery.isLoading,
    cargos: cargosQuery.data ?? [],
    cargosLoading: cargosQuery.isLoading,
    createCargo: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateCargo: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteCargo: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
  };
}
