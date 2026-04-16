import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BaseSyntheticEvent } from "react";
import axios from "axios";
import { loginService } from "../service/loginService";
import type { CreditCardOverviewData, Movimiento } from "../service/loginService";
import { useAppStore } from "../store/appStore";
import type {
  AppView,
  MovementFilter,
  MovementSourceFilter,
  MovementStatementFilter,
  PrivateView,
  PublicView,
} from "../types/view.types";
import { authViewLabels, privateViewLabels } from "../types/view.types";
import { isValidRut } from "../utils/rutUtils";

const authViews: PublicView[] = ["login", "forgot", "reset", "create-account"];
const privateViews: PrivateView[] = [
  "inicio",
  "movimientos",
  "tarjeta-credito",
  "metricas",
  "resumen",
  "configuracion",
];

export const useFinanceAppController = () => {
  const queryClient = useQueryClient();

  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);
  const showSnackbar = useAppStore((state) => state.showSnackbar);

  const [activeView, setActiveView] = useState<AppView>(token ? "inicio" : "login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rut: "",
    password: "",
  });
  const [registerRutError, setRegisterRutError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });

  const [movementSearch, setMovementSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all");
  const [movementSourceFilter, setMovementSourceFilter] =
    useState<MovementSourceFilter>("all");
  const [movementStatementFilter, setMovementStatementFilter] =
    useState<MovementStatementFilter>("all");

  const [syncForm, setSyncForm] = useState({ rut: "", password: "" });
  const [rutError, setRutError] = useState("");
  const [scrapedMovements, setScrapedMovements] = useState<Movimiento[]>([]);
  const lastDashboardErrorRef = useRef("");

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (isAuthenticated && authViews.includes(activeView as PublicView)) {
      setActiveView("inicio");
    }

    if (!isAuthenticated && privateViews.includes(activeView as PrivateView)) {
      setActiveView("login");
    }
  }, [activeView, isAuthenticated]);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", token],
    queryFn: () => loginService.getMyTransactions(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const metricsQuery = useQuery({
    queryKey: ["metrics", token],
    queryFn: () => loginService.getMyMetrics(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const resumenQuery = useQuery({
    queryKey: ["resumen", token],
    queryFn: () => loginService.getMyResumen(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const creditCardOverviewQuery = useQuery({
    queryKey: ["credit-card-overview", token],
    queryFn: () => loginService.getMyCreditCardOverview(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  useEffect(() => {
    const dashboardError =
      transactionsQuery.error ||
      metricsQuery.error ||
      resumenQuery.error ||
      creditCardOverviewQuery.error;

    if (!dashboardError) {
      lastDashboardErrorRef.current = "";
      return;
    }

    if (!axios.isAxiosError(dashboardError)) {
      if (lastDashboardErrorRef.current !== "unknown") {
        showSnackbar("No se pudieron cargar datos del dashboard.", "error");
        lastDashboardErrorRef.current = "unknown";
      }
      return;
    }

    const status = dashboardError.response?.status;
    const signature = `axios:${status || 0}`;
    if (lastDashboardErrorRef.current === signature) {
      return;
    }

    if (status === 401) {
      clearSession();
      setActiveView("login");
      showSnackbar("Tu sesion expiro. Inicia sesion nuevamente.", "error");
      lastDashboardErrorRef.current = signature;
      return;
    }

    showSnackbar("No se pudieron cargar tus transacciones y metricas.", "error");
    lastDashboardErrorRef.current = signature;
  }, [
    clearSession,
    creditCardOverviewQuery.error,
    metricsQuery.error,
    resumenQuery.error,
    setActiveView,
    showSnackbar,
    transactionsQuery.error,
  ]);

  const refreshDashboard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions", token] }),
      queryClient.invalidateQueries({ queryKey: ["metrics", token] }),
      queryClient.invalidateQueries({ queryKey: ["resumen", token] }),
      queryClient.invalidateQueries({ queryKey: ["credit-card-overview", token] }),
    ]);
  };

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      loginService.authLogin(payload.email, payload.password),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      showSnackbar("Sesion iniciada correctamente.", "success");
      setActiveView("inicio");
    },
    onError: () => {
      showSnackbar("No se pudo iniciar sesion con esas credenciales.", "error");
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => loginService.register(registerForm),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      showSnackbar("Cuenta creada y sesion iniciada.", "success");
      setActiveView("inicio");
    },
    onError: () => {
      showSnackbar("No fue posible crear la cuenta.", "error");
    },
  });

  const forgotMutation = useMutation({
    mutationFn: () => loginService.forgotPassword(forgotEmail),
    onSuccess: (data) => {
      if (data.resetToken) {
        setResetForm((current) => ({
          ...current,
          token: data.resetToken || "",
        }));
        setActiveView("reset");
      }
      showSnackbar(data.message, "info");
    },
    onError: () => {
      showSnackbar("No fue posible generar token de recuperacion.", "error");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => loginService.resetPassword(resetForm.token, resetForm.password),
    onSuccess: (data) => {
      showSnackbar(data.message, "success");
      setActiveView("login");
      setLoginForm((current) => ({ ...current, email: forgotEmail }));
    },
    onError: () => {
      showSnackbar("No fue posible restablecer la password.", "error");
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => loginService.loginRabbitMQ(syncForm.rut, syncForm.password),
    onSuccess: () => {
      showSnackbar(
        "Solicitud de scraping enviada. Espera unos segundos y luego carga movimientos.",
        "success",
      );
    },
    onError: () => {
      showSnackbar("No se pudo iniciar el scraping en RabbitMQ.", "error");
    },
  });

  const scrapeQueryMutation = useMutation({
    mutationFn: () => loginService.getData(syncForm.rut),
    onSuccess: (response) => {
      setScrapedMovements(response.movimientos);
      showSnackbar(
        `Se cargaron ${response.movimientos.length} movimientos del scraping para ${response.rut}.`,
        "success",
      );
    },
    onError: () => {
      showSnackbar("No hay movimientos scrapeados disponibles para ese RUT.", "error");
    },
  });

  const handleLoginSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showSnackbar("Email y password son obligatorios para login.", "error");
      return;
    }

    loginMutation.mutate({
      email: loginForm.email,
      password: loginForm.password,
    });
  };

  const handleRegisterSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    if (
      !registerForm.nombre ||
      !registerForm.apellido ||
      !registerForm.email ||
      !registerForm.rut ||
      !registerForm.password
    ) {
      showSnackbar("Completa todos los campos para crear cuenta.", "error");
      return;
    }

    if (!isValidRut(registerForm.rut)) {
      setRegisterRutError("RUT invalido");
      showSnackbar("Ingresa un RUT valido para crear cuenta.", "error");
      return;
    }

    registerMutation.mutate();
  };

  const handleRegisterRutValidity = (isValid: boolean) => {
    setRegisterRutError(isValid || !registerForm.rut ? "" : "RUT invalido");
  };

  const handleForgotSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();
    if (!forgotEmail) {
      showSnackbar("Ingresa tu email para recuperar password.", "error");
      return;
    }

    forgotMutation.mutate();
  };

  const handleResetSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();

    if (!resetForm.token || !resetForm.password || !resetForm.confirmPassword) {
      showSnackbar("Completa token y nueva password.", "error");
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      showSnackbar("Las passwords no coinciden.", "error");
      return;
    }

    resetMutation.mutate();
  };

  const handleStartSync = () => {
    if (rutError) {
      showSnackbar("El RUT no es valido.", "error");
      return;
    }

    if (!syncForm.rut || !syncForm.password) {
      showSnackbar("Debes ingresar RUT y password para sincronizar.", "error");
      return;
    }

    syncMutation.mutate();
  };

  const handleFetchScrapedData = () => {
    if (rutError) {
      showSnackbar("El RUT no es valido.", "error");
      return;
    }

    if (!syncForm.rut) {
      showSnackbar("Ingresa el RUT para obtener movimientos scrapeados.", "error");
      return;
    }

    scrapeQueryMutation.mutate();
  };

  const handleRutValidity = (isValid: boolean) => {
    setRutError(isValid || !syncForm.rut ? "" : "RUT invalido");
  };

  const handleLogout = () => {
    clearSession();
    setActiveView("login");
    showSnackbar("Sesion cerrada.", "info");
  };

  const transactions = transactionsQuery.data || [];
  const metrics =
    metricsQuery.data ||
    {
      totalIngresos: 0,
      totalGastos: 0,
      balance: 0,
      cantidadMovimientos: 0,
      ticketPromedio: 0,
      gastoMensualPromedio: 0,
    };
  const resumen = resumenQuery.data || { byCategory: [], bySource: [], recent: [] };
  const creditCardOverview: CreditCardOverviewData =
    creditCardOverviewQuery.data ||
    {
      currentMonth: "",
      summaries: [],
      projections: [],
      recentPayments: [],
    };

  const visibleTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const sourceType = transaction.fuente?.tipo || transaction.rawData?.sourceType;
      const statementType =
        typeof transaction.rawData?.statementType === "string"
          ? transaction.rawData.statementType.toLowerCase()
          : "";
      const scopeValue =
        typeof transaction.rawData?.scope === "string"
          ? transaction.rawData.scope.toLowerCase()
          : "";

      let byType = true;
      if (movementFilter === "ingreso") {
        byType = transaction.tipoOperacion === "INGRESO";
      } else if (movementFilter === "gasto") {
        byType = transaction.tipoOperacion === "GASTO";
      }

      let bySource = true;
      if (movementSourceFilter === "cuenta-corriente") {
        bySource = sourceType === "BANCO_CHILE_CC";
      } else if (movementSourceFilter === "tarjeta-credito") {
        bySource = sourceType === "BANCO_CHILE_TC";
      }

      let byStatement = true;
      if (movementStatementFilter === "facturados") {
        byStatement = sourceType === "BANCO_CHILE_TC" && statementType === "facturados";
      } else if (movementStatementFilter === "no-facturados") {
        byStatement = sourceType === "BANCO_CHILE_TC" && statementType === "no_facturados";
      }

      const query = movementSearch.trim().toLowerCase();
      const bySearch =
        query.length === 0
          ? true
          : transaction.nombreComercio.toLowerCase().includes(query) ||
            (transaction.categoria?.nombre || "").toLowerCase().includes(query) ||
            (transaction.fuente?.identificador || "")
              .toLowerCase()
              .includes(query) ||
            statementType.includes(query) ||
            scopeValue.includes(query);

      return byType && bySource && byStatement && bySearch;
    });
  }, [
    movementFilter,
    movementSearch,
    movementSourceFilter,
    movementStatementFilter,
    transactions,
  ]);

  const categoryMax = useMemo(() => {
    const values = resumen.byCategory.map((item) => item.amount);
    const max = values.length ? Math.max(...values) : 0;
    return max > 0 ? max : 1;
  }, [resumen.byCategory]);

  const sourceMax = useMemo(() => {
    const values = resumen.bySource.map((item) => item.amount);
    const max = values.length ? Math.max(...values) : 0;
    return max > 0 ? max : 1;
  }, [resumen.bySource]);

  const authTabs = authViews.map((view) => ({
    value: view,
    label: authViewLabels[view],
  }));

  const privateTabs = privateViews.map((view) => ({
    value: view,
    label: privateViewLabels[view],
  }));

  return {
    token,
    user,
    isAuthenticated,
    activeView,
    setActiveView,
    authTabs,
    privateTabs,
    refreshDashboard,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    registerRutError,
    handleRegisterRutValidity,
    forgotEmail,
    setForgotEmail,
    resetForm,
    setResetForm,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleForgotSubmit,
    handleResetSubmit,
    authLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      forgotMutation.isPending ||
      resetMutation.isPending,
    dashboardLoading:
      transactionsQuery.isLoading ||
      metricsQuery.isLoading ||
      resumenQuery.isLoading ||
      creditCardOverviewQuery.isLoading,
    movementSearch,
    setMovementSearch,
    movementFilter,
    setMovementFilter,
    movementSourceFilter,
    setMovementSourceFilter,
    movementStatementFilter,
    setMovementStatementFilter,
    visibleTransactions,
    metrics,
    resumen,
    creditCardOverview,
    categoryMax,
    sourceMax,
    syncForm,
    setSyncForm,
    rutError,
    handleRutValidity,
    syncLoading: syncMutation.isPending || scrapeQueryMutation.isPending,
    handleStartSync,
    handleFetchScrapedData,
    scrapedMovements,
    handleLogout,
  };
};
