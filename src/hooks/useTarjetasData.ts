import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginService } from "../service/loginService";
import type { CreateTarjetaDto, UpdateTarjetaPayload } from "../service/loginService";
import { useAppStore } from "../store/appStore";

const TARJETAS_KEY = ["tarjetas", "me"];
const DATA_SOURCES_KEY = ["data-sources", "me"];

export function useTarjetasData() {
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const qc = useQueryClient();

  const tarjetasQuery = useQuery({
    queryKey: TARJETAS_KEY,
    queryFn: loginService.getMyTarjetas,
    staleTime: 1000 * 60 * 5,
  });

  const dataSourcesQuery = useQuery({
    queryKey: DATA_SOURCES_KEY,
    queryFn: loginService.getMyDataSources,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTarjetaDto) => loginService.createTarjeta(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TARJETAS_KEY });
      showSnackbar("Tarjeta guardada", "success");
    },
    onError: () => showSnackbar("Error al guardar tarjeta", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTarjetaPayload }) =>
      loginService.updateTarjeta(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TARJETAS_KEY });
      showSnackbar("Tarjeta actualizada", "success");
    },
    onError: () => showSnackbar("Error al actualizar tarjeta", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => loginService.deleteTarjeta(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: TARJETAS_KEY });
      showSnackbar("Tarjeta eliminada", "success");
    },
    onError: () => showSnackbar("Error al eliminar tarjeta", "error"),
  });

  return {
    tarjetas: tarjetasQuery.data ?? [],
    tarjetasLoading: tarjetasQuery.isLoading,
    dataSources: dataSourcesQuery.data ?? [],
    dataSourcesLoading: dataSourcesQuery.isLoading,
    createTarjeta: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateTarjeta: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteTarjeta: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
  };
}
