import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginService } from "../service/loginService";
import { useAppStore } from "../store/appStore";

const INDICADORES_KEY = ["indicadores", "ultimos"];

/** Los valores viven en BD y solo cambian una vez al día: caché larga. */
export function useIndicadoresData() {
  const token = useAppStore((s) => s.token);
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const qc = useQueryClient();

  const indicadoresQuery = useQuery({
    queryKey: INDICADORES_KEY,
    queryFn: loginService.getIndicadores,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 60,
  });

  const syncMutation = useMutation({
    mutationFn: loginService.syncIndicadores,
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: INDICADORES_KEY });
      void qc.invalidateQueries({ queryKey: ["credit-card-projection", token] });
      showSnackbar(
        `Indicadores actualizados (${result.sincronizados})`,
        "success",
      );
    },
    onError: () =>
      showSnackbar("No se pudieron actualizar los indicadores", "error"),
  });

  const indicadores = indicadoresQuery.data ?? [];

  return {
    indicadores,
    indicadoresLoading: indicadoresQuery.isLoading,
    getIndicador: (codigo: string) =>
      indicadores.find((item) => item.codigo === codigo) ?? null,
    syncIndicadores: syncMutation.mutate,
    syncLoading: syncMutation.isPending,
  };
}
