import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BaseSyntheticEvent } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { envConfig } from "../config/env";
import { loginService } from "../service/loginService";
import type {
  CreditCardOverviewData,
  Movimiento,
} from "../service/loginService";
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
  "reservas-mercadopago",
  "configuracion",
];

const GOOGLE_CALLBACK_PATH = "/auth/google/callback";
const GOOGLE_OAUTH_STATE_KEY = "google_oauth_state";
const GOOGLE_OAUTH_LOGIN_PREFIX = "login";
const GOOGLE_OAUTH_LINK_PREFIX = "link";

const createGoogleOAuthState = (flow: "login" | "link") => {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const nonce = Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  return `${flow}:${nonce}`;
};

const resolveGoogleFlowFromState = (state: string): "login" | "link" => {
  if (state.startsWith(`${GOOGLE_OAUTH_LINK_PREFIX}:`)) {
    return "link";
  }

  return "login";
};

export const useFinanceAppController = () => {
  const queryClient = useQueryClient();

  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);
  const showSnackbar = useAppStore((state) => state.showSnackbar);

  const [activeView, setActiveView] = useState<AppView>(
    token ? "inicio" : "login",
  );

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
  const [googleRutForm, setGoogleRutForm] = useState({ rut: "" });
  const [googleRutError, setGoogleRutError] = useState("");

  const [movementSearch, setMovementSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("all");
  const [movementSourceFilter, setMovementSourceFilter] =
    useState<MovementSourceFilter>("all");
  const [movementStatementFilter, setMovementStatementFilter] =
    useState<MovementStatementFilter>("all");

  const [syncForm, setSyncForm] = useState({ rut: "", password: "" });
  const [mpSyncForm, setMpSyncForm] = useState({ email: "", password: "" });
  const [rutError, setRutError] = useState("");
  const [scrapedMovements, setScrapedMovements] = useState<Movimiento[]>([]);
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const lastDashboardErrorRef = useRef("");
  const processedGoogleCodeRef = useRef("");

  const isAuthenticated = Boolean(token);
  const requiresGoogleRutCompletion = Boolean(
    isAuthenticated && user?.rutPendiente,
  );

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

  const [metricsMonth, setMetricsMonth] = useState<string>(
    new Date().toISOString().slice(0, 7), // YYYY-MM
  );

  const metricsQuery = useQuery({
    queryKey: ["metrics", token, metricsMonth],
    queryFn: () => loginService.getMyMetrics(metricsMonth),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const resumenQuery = useQuery({
    queryKey: ["resumen", token, metricsMonth],
    queryFn: () => loginService.getMyResumen(metricsMonth),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const creditCardOverviewQuery = useQuery({
    queryKey: ["credit-card-overview", token],
    queryFn: () => loginService.getMyCreditCardOverview(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const reservasQuery = useQuery({
    queryKey: ["reservas", token],
    queryFn: () => loginService.getMisReservas(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const triggerMpSyncMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      loginService.triggerMercadoPagoSync(payload.email, payload.password),
    onSuccess: () => {
      showSnackbar("Sincronización de MercadoPago iniciada.", "success");
    },
    onError: () => {
      showSnackbar("No se pudo iniciar la sincronización de MercadoPago.", "error");
    },
  });

  const completeMfaMutation = useMutation({
    mutationFn: (sessionId: string) => loginService.completeMfa(sessionId),
    onSuccess: () => {
      showSnackbar("Verificación enviada. Continuando...", "success");
      setMfaSessionId(null);
    },
    onError: () => {
      showSnackbar("No se pudo completar la verificación MFA.", "error");
    },
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

    showSnackbar(
      "No se pudieron cargar tus transacciones y metricas.",
      "error",
    );
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
      queryClient.invalidateQueries({
        queryKey: ["credit-card-overview", token],
      }),
      queryClient.invalidateQueries({
        queryKey: ["credit-card-projection", token],
      }),
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

  const googleStartMutation = useMutation({
    mutationFn: (state: string) => loginService.getGoogleAuthUrl(state),
    onSuccess: (authUrl) => {
      globalThis.location.assign(authUrl);
    },
    onError: () => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      showSnackbar("No fue posible iniciar sesion con Google.", "error");
    },
  });

  const googleExchangeMutation = useMutation({
    mutationFn: (code: string) => loginService.exchangeGoogleCode(code),
    onSuccess: (data) => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      setSession(data.accessToken, data.user);
      setActiveView(data.user.rutPendiente ? "configuracion" : "inicio");
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      if (data.user.rutPendiente) {
        showSnackbar("Completa tu RUT para activar tu cuenta.", "info");
      } else {
        showSnackbar("Sesion iniciada correctamente con Google.", "success");
      }
    },
    onError: () => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      setActiveView("login");
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar("No fue posible completar el login con Google.", "error");
    },
  });

  const googleLinkStartMutation = useMutation({
    mutationFn: (state: string) => loginService.getGoogleLinkAuthUrl(state),
    onSuccess: (authUrl) => {
      globalThis.location.assign(authUrl);
    },
    onError: () => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      showSnackbar(
        "No fue posible iniciar la vinculacion con Google.",
        "error",
      );
    },
  });

  const googleLinkExchangeMutation = useMutation({
    mutationFn: (code: string) => loginService.exchangeGoogleLinkCode(code),
    onSuccess: (data) => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      setSession(data.accessToken, data.user);
      setActiveView("configuracion");
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar("Cuenta de Google vinculada correctamente.", "success");
    },
    onError: () => {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar("No fue posible vincular tu cuenta de Google.", "error");
    },
  });

  const completeGoogleRutMutation = useMutation({
    mutationFn: (rut: string) => loginService.completeGoogleRut(rut),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      setGoogleRutForm({ rut: "" });
      setGoogleRutError("");
      setActiveView("inicio");
      showSnackbar("Perfil completado correctamente.", "success");
    },
    onError: () => {
      showSnackbar(
        "No fue posible guardar tu RUT. Verifica e intenta nuevamente.",
        "error",
      );
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
    mutationFn: () =>
      loginService.resetPassword(resetForm.token, resetForm.password),
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
    mutationFn: () =>
      loginService.loginRabbitMQ(syncForm.rut, syncForm.password),
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
      showSnackbar(
        "No hay movimientos scrapeados disponibles para ese RUT.",
        "error",
      );
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (payload: { id: number; comentario: string }) =>
      loginService.updateTransaction(payload.id, {
        comentarios: payload.comentario,
      }),
    onSuccess: () => {
      showSnackbar("Comentario actualizado correctamente.", "success");
      void refreshDashboard();
    },
    onError: () => {
      showSnackbar("No fue posible actualizar el comentario.", "error");
    },
  });

  const categorizeWithAiMutation = useMutation({
    mutationFn: (id: number) => loginService.categorizeTransactionWithAi(id),
    onSuccess: () => {
      showSnackbar("Categorización por IA completada.", "success");
      void refreshDashboard();
    },
    onError: () => {
      showSnackbar("No fue posible categorizar con IA.", "error");
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(envConfig.socketUrl);

    socket.on(`mfa-challenge-${user.id}`, (data: { sessionId: string }) => {
      setMfaSessionId(data.sessionId);
    });

    socket.on(`reservas-guardadas-${user.id}`, (data: { status: string; mensaje: string }) => {
      showSnackbar(data.mensaje, data.status === "success" ? "success" : "error");
      void queryClient.invalidateQueries({ queryKey: ["reservas", token] });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, token, queryClient, showSnackbar]);

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

  const handleGoogleLogin = () => {
    const state = createGoogleOAuthState(GOOGLE_OAUTH_LOGIN_PREFIX);
    localStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
    googleStartMutation.mutate(state);
  };

  const handleGoogleLink = () => {
    if (!isAuthenticated) {
      showSnackbar("Debes iniciar sesion para vincular Google.", "error");
      return;
    }

    const state = createGoogleOAuthState(GOOGLE_OAUTH_LINK_PREFIX);
    localStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
    googleLinkStartMutation.mutate(state);
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
      showSnackbar(
        "Ingresa el RUT para obtener movimientos scrapeados.",
        "error",
      );
      return;
    }

    scrapeQueryMutation.mutate();
  };

  const handleRutValidity = (isValid: boolean) => {
    setRutError(isValid || !syncForm.rut ? "" : "RUT invalido");
  };

  const handleGoogleRutValidity = (isValid: boolean) => {
    setGoogleRutError(isValid || !googleRutForm.rut ? "" : "RUT invalido");
  };

  const handleCompleteGoogleRutSubmit = (event: BaseSyntheticEvent) => {
    event.preventDefault();

    if (!googleRutForm.rut) {
      showSnackbar("Ingresa tu RUT para completar el perfil.", "error");
      return;
    }

    if (!isValidRut(googleRutForm.rut)) {
      setGoogleRutError("RUT invalido");
      showSnackbar("Ingresa un RUT valido para continuar.", "error");
      return;
    }

    completeGoogleRutMutation.mutate(googleRutForm.rut);
  };

  const handleLogout = () => {
    clearSession();
    setActiveView("login");
    showSnackbar("Sesion cerrada.", "info");
  };

  useEffect(() => {
    if (globalThis.location.pathname !== GOOGLE_CALLBACK_PATH) {
      return;
    }

    const searchParams = new URLSearchParams(globalThis.location.search);
    const googleError = searchParams.get("error");
    const code = searchParams.get("code") || "";
    const state = searchParams.get("state") || "";

    if (googleError) {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      if (!isAuthenticated) {
        setActiveView("login");
      }
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar(
        "Google rechazo la autenticacion. Intenta nuevamente.",
        "error",
      );
      return;
    }

    if (!code) {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      if (!isAuthenticated) {
        setActiveView("login");
      }
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar("No se recibio codigo OAuth de Google.", "error");
      return;
    }

    const expectedState = localStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    if (!state || !expectedState || state !== expectedState) {
      localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
      if (!isAuthenticated) {
        setActiveView("login");
      }
      globalThis.history.replaceState({}, globalThis.document.title, "/");
      showSnackbar(
        "No se pudo validar el estado de seguridad de Google.",
        "error",
      );
      return;
    }

    if (processedGoogleCodeRef.current === code) {
      return;
    }

    processedGoogleCodeRef.current = code;
    const flow = resolveGoogleFlowFromState(state);
    if (flow === "link") {
      googleLinkExchangeMutation.mutate(code);
      return;
    }

    googleExchangeMutation.mutate(code);
  }, [
    googleExchangeMutation,
    googleLinkExchangeMutation,
    isAuthenticated,
    setActiveView,
    showSnackbar,
  ]);

  const transactions = transactionsQuery.data || [];
  const metrics = metricsQuery.data || {
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0,
    cantidadMovimientos: 0,
    ticketPromedio: 0,
    gastoMensualPromedio: 0,
  };
  const resumen = resumenQuery.data || {
    byCategory: [],
    bySource: [],
    recent: [],
  };
  const creditCardOverview: CreditCardOverviewData =
    creditCardOverviewQuery.data || {
      currentMonth: "",
      summaries: [],
      projections: [],
      recentPayments: [],
    };

  const visibleTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const sourceType =
        transaction.fuente?.tipo || transaction.rawData?.sourceType;
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
        byStatement =
          sourceType === "BANCO_CHILE_TC" && statementType === "facturados";
      } else if (movementStatementFilter === "no-facturados") {
        byStatement =
          sourceType === "BANCO_CHILE_TC" && statementType === "no_facturados";
      }

      const query = movementSearch.trim().toLowerCase();
      const bySearch =
        query.length === 0
          ? true
          : transaction.nombreComercio.toLowerCase().includes(query) ||
            (transaction.categoria?.nombre || "")
              .toLowerCase()
              .includes(query) ||
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
    requiresGoogleRutCompletion,
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
    googleRutForm,
    setGoogleRutForm,
    googleRutError,
    handleGoogleRutValidity,
    handleCompleteGoogleRutSubmit,
    handleLoginSubmit,
    handleGoogleLogin,
    handleGoogleLink,
    handleRegisterSubmit,
    handleForgotSubmit,
    handleResetSubmit,
    authLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      forgotMutation.isPending ||
      resetMutation.isPending,
    googleAuthLoading:
      googleStartMutation.isPending || googleExchangeMutation.isPending,
    googleLinkLoading:
      googleLinkStartMutation.isPending || googleLinkExchangeMutation.isPending,
    googleRutLoading: completeGoogleRutMutation.isPending,
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
    transactions,
    visibleTransactions,
    metrics,
    resumen,
    creditCardOverview,
    categoryMax,
    sourceMax,
    syncForm,
    setSyncForm,
    mpSyncForm,
    setMpSyncForm,
    rutError,
    handleRutValidity,
    syncLoading: syncMutation.isPending || scrapeQueryMutation.isPending,
    handleStartSync,
    handleFetchScrapedData,
    scrapedMovements,
    handleLogout,
    updateComment: (id: number, comentario: string) =>
      updateCommentMutation.mutate({ id, comentario }),
    updateCommentLoading: updateCommentMutation.isPending,
    categorizeWithAi: (id: number) => categorizeWithAiMutation.mutate(id),
    categorizeWithAiLoading: categorizeWithAiMutation.isPending,
    reservas: reservasQuery.data || [],
    reservasLoading: reservasQuery.isLoading,
    triggerMpSync: (email: string, password: string) =>
      triggerMpSyncMutation.mutate({ email, password }),
    mpSyncLoading: triggerMpSyncMutation.isPending,
    mfaSessionId,
    handleCompleteMfa: (sessionId: string) => completeMfaMutation.mutate(sessionId),
    metricsMonth,
    setMetricsMonth,
  };
};
