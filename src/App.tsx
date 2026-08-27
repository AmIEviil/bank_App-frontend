import "./App.css";
import { useFinanceAppController } from "./hooks/useFinanceAppController";
import { Snackbar } from "./components/ui/Snackbar";
import { Button } from "./components/ui/Button";
import { LoginView } from "./components/views/auth/LoginView";
import { CreateAccountView } from "./components/views/auth/CreateAccountView";
import { ForgotPasswordView } from "./components/views/auth/ForgotPasswordView";
import { ResetPasswordView } from "./components/views/auth/ResetPasswordView";
import { CompleteGoogleProfileView } from "./components/views/auth/CompleteGoogleProfileView";
import { InicioView } from "./components/views/private/InicioView";
import { MovimientosView } from "./components/views/private/MovimientosView";
import { MetricasView } from "./components/views/private/MetricasView";
import { ResumenView } from "./components/views/private/ResumenView";
import { TarjetaCreditoView } from "./components/views/private/TarjetaCreditoView";
import { ConfiguracionView } from "./components/views/private/ConfiguracionView";
import { ReservasMercadoPagoView } from "./components/views/private/ReservasMercadoPagoView";
import { HogarView } from "./components/views/private/HogarView";
import type { AppView, PrivateView } from "./types/view.types";
import ModalVisualizer from "./components/ui/modal/Modal";
import { useModalStore } from "./store/appStore";
import { useEffect } from "react";
import { useTarjetasData } from "./hooks/useTarjetasData";
import { useProyeccionData } from "./hooks/useProyeccionData";

/* ── Sidebar nav items ──────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Cuentas",
    items: [
      { id: "inicio", label: "Inicio", ico: "◈" },
      { id: "movimientos", label: "Movimientos", ico: "↕" },
      { id: "tarjeta-credito", label: "Tarjeta crédito", ico: "▣" },
      { id: "hogar", label: "Hogar", ico: "⌂" },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { id: "metricas", label: "Métricas", ico: "◎" },
      { id: "resumen", label: "Resumen", ico: "≡" },
      { id: "reservas-mercadopago", label: "Reservas MP", ico: "◇" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "configuracion", label: "Configuración", ico: "⚙" },
    ],
  },
] as const;

const MOBILE_TABS = [
  { id: "inicio", label: "Inicio", ico: "◈" },
  { id: "movimientos", label: "Mov.", ico: "↕" },
  { id: "metricas", label: "Métricas", ico: "◎" },
  { id: "tarjeta-credito", label: "TC", ico: "▣" },
  { id: "configuracion", label: "Config.", ico: "⚙" },
] as const;

const VIEW_LABELS: Record<PrivateView, string> = {
  inicio: "Inicio",
  movimientos: "Movimientos",
  "tarjeta-credito": "Tarjeta de crédito",
  hogar: "Gestión del Hogar",
  metricas: "Métricas",
  resumen: "Resumen",
  "reservas-mercadopago": "Reservas MP",
  configuracion: "Configuración",
};

/* ── Auth tab items ─────────────────────────────────────── */
const AUTH_TABS = [
  { id: "login", label: "Ingresar" },
  { id: "create-account", label: "Registrarse" },
] as const;

function App() {
  const controller = useFinanceAppController();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const tarjetasData = useTarjetasData();
  // Resumen corto para Inicio; la vista de TC maneja su propio horizonte.
  const proyeccionInicio = useProyeccionData(3);

  useEffect(() => {
    if (controller.mfaSessionId) {
      openModal({
        header: "Verificación requerida (MFA)",
        content: (
          <div style={{ display: "grid", gap: "1rem" }}>
            <p>
              Tu cuenta de Google requiere una verificación adicional. Confirma
              el acceso en tu dispositivo móvil o correo electrónico.
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7, color: "var(--ink-2)" }}>
              Una vez confirmada la verificación, haz clic en "Continuar" para
              que el crawler pueda seguir extrayendo tus reservas.
            </p>
          </div>
        ),
        footer: (
          <>
            <Button variant="secondary" onClick={() => closeModal()}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                controller.handleCompleteMfa(controller.mfaSessionId!);
                closeModal();
              }}
            >
              Continuar
            </Button>
          </>
        ),
      });
    }
  }, [controller.mfaSessionId, openModal, closeModal, controller]);

  /* ── Auth views ─────────────────────────────────────────── */
  const renderAuthView = () => {
    if (controller.activeView === "login") {
      return (
        <LoginView
          email={controller.loginForm.email}
          password={controller.loginForm.password}
          loading={controller.authLoading}
          googleLoading={controller.googleAuthLoading}
          onSubmit={controller.handleLoginSubmit}
          onEmailChange={(email) =>
            controller.setLoginForm((c) => ({ ...c, email }))
          }
          onPasswordChange={(password) =>
            controller.setLoginForm((c) => ({ ...c, password }))
          }
          onGoogleLogin={controller.handleGoogleLogin}
          onGoRegister={() => controller.setActiveView("create-account")}
          onGoForgot={() => controller.setActiveView("forgot")}
        />
      );
    }

    if (controller.activeView === "create-account") {
      return (
        <CreateAccountView
          form={controller.registerForm}
          rutError={controller.registerRutError}
          loading={controller.authLoading}
          onSubmit={controller.handleRegisterSubmit}
          onChange={(field, value) =>
            controller.setRegisterForm((c) => ({ ...c, [field]: value }))
          }
          onRutValidityChange={controller.handleRegisterRutValidity}
          onGoLogin={() => controller.setActiveView("login")}
        />
      );
    }

    if (controller.activeView === "forgot") {
      return (
        <ForgotPasswordView
          email={controller.forgotEmail}
          loading={controller.authLoading}
          onSubmit={controller.handleForgotSubmit}
          onEmailChange={controller.setForgotEmail}
          onGoLogin={() => controller.setActiveView("login")}
        />
      );
    }

    return (
      <ResetPasswordView
        form={controller.resetForm}
        loading={controller.authLoading}
        onSubmit={controller.handleResetSubmit}
        onChange={(field, value) =>
          controller.setResetForm((c) => ({ ...c, [field]: value }))
        }
      />
    );
  };

  /* ── Private views ──────────────────────────────────────── */
  const renderPrivateView = () => {
    if (
      controller.dashboardLoading &&
      controller.activeView !== "configuracion"
    ) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Cargando datos...
        </div>
      );
    }

    if (controller.activeView === "inicio") {
      return (
        <InicioView
          userName={controller.user?.nombre || ""}
          metrics={controller.metrics}
          creditCardOverview={controller.creditCardOverview}
          projectionMonths={proyeccionInicio.projection.months}
          onGoMovimientos={() => controller.setActiveView("movimientos")}
          onGoMetricas={() => controller.setActiveView("metricas")}
        />
      );
    }

    if (controller.activeView === "movimientos") {
      return (
        <MovimientosView
          search={controller.movementSearch}
          filter={controller.movementFilter}
          sourceFilter={controller.movementSourceFilter}
          statementFilter={controller.movementStatementFilter}
          transactions={controller.visibleTransactions}
          onSearchChange={controller.setMovementSearch}
          onFilterChange={controller.setMovementFilter}
          onSourceFilterChange={controller.setMovementSourceFilter}
          onStatementFilterChange={controller.setMovementStatementFilter}
          onCategorizeWithAi={controller.categorizeWithAi}
          categorizeLoading={controller.categorizeWithAiLoading}
        />
      );
    }

    if (controller.activeView === "metricas") {
      return (
        <MetricasView
          metrics={controller.metrics}
          resumen={controller.resumen}
          categoryMax={controller.categoryMax}
          selectedMonth={controller.metricsMonth}
          onMonthChange={controller.setMetricsMonth}
        />
      );
    }

    if (controller.activeView === "tarjeta-credito") {
      return (
        <TarjetaCreditoView
          overview={controller.creditCardOverview}
          transactions={controller.transactions}
        />
      );
    }

    if (controller.activeView === "hogar") {
      return <HogarView />;
    }

    if (controller.activeView === "resumen") {
      return (
        <ResumenView
          resumen={controller.resumen}
          sourceMax={controller.sourceMax}
        />
      );
    }

    if (controller.activeView === "reservas-mercadopago") {
      return (
        <ReservasMercadoPagoView
          reservas={controller.reservas}
          loading={controller.reservasLoading}
        />
      );
    }

    return (
      <ConfiguracionView
        syncForm={controller.syncForm}
        mpSyncForm={controller.mpSyncForm}
        rutError={controller.rutError}
        syncLoading={controller.syncLoading}
        mpSyncLoading={controller.mpSyncLoading}
        googleLinked={Boolean(controller.user?.googleLinked)}
        googleLinkLoading={controller.googleLinkLoading}
        scrapedMovements={controller.scrapedMovements}
        dataSources={tarjetasData.dataSources}
        tarjetas={tarjetasData.tarjetas}
        tarjetasLoading={tarjetasData.tarjetasLoading}
        onRutChange={(rut) =>
          controller.setSyncForm((c) => ({ ...c, rut }))
        }
        onRutValidityChange={controller.handleRutValidity}
        onPasswordChange={(password) =>
          controller.setSyncForm((c) => ({ ...c, password }))
        }
        onMpEmailChange={(email) =>
          controller.setMpSyncForm((c) => ({ ...c, email }))
        }
        onMpPasswordChange={(password) =>
          controller.setMpSyncForm((c) => ({ ...c, password }))
        }
        onLinkGoogle={controller.handleGoogleLink}
        onSync={controller.handleStartSync}
        onMpSync={() =>
          controller.triggerMpSync(controller.mpSyncForm.email, controller.mpSyncForm.password)
        }
        onFetchScraping={controller.handleFetchScrapedData}
        onLogout={controller.handleLogout}
        onCreateTarjeta={tarjetasData.createTarjeta}
        onUpdateTarjeta={tarjetasData.updateTarjeta}
        onDeleteTarjeta={tarjetasData.deleteTarjeta}
        tarjetaCreateLoading={tarjetasData.createLoading}
        tarjetaUpdateLoading={tarjetasData.updateLoading}
      />
    );
  };

  /* ── Not authenticated ──────────────────────────────────── */
  if (!controller.isAuthenticated) {
    const isAuthTab = (id: string) =>
      controller.activeView === id ||
      (controller.activeView === "forgot" && id === "login") ||
      (controller.activeView === "reset" && id === "login");

    return (
      <div className="app-root">
        <Snackbar />
        <div className="auth-root">
          <div className="auth-brand" style={{ marginBottom: 28 }}>
            <div className="auth-brand-mark">b</div>
            <div>
              <div className="auth-brand-text">banco<em>.</em></div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.18em", color: "var(--ink-3)", textTransform: "uppercase", marginTop: 2 }}>
                Personal · CL
              </div>
            </div>
          </div>

          {controller.activeView !== "forgot" && controller.activeView !== "reset" && (
            <div className="auth-tabs-bar">
              {AUTH_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`auth-tab-btn ${isAuthTab(tab.id) ? "active" : ""}`}
                  onClick={() => controller.setActiveView(tab.id as AppView)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {renderAuthView()}
        </div>
      </div>
    );
  }

  /* ── Authenticated — Google RUT completion ──────────────── */
  if (controller.requiresGoogleRutCompletion) {
    return (
      <div className="app-root">
        <Snackbar />
        <div className="auth-root">
          <CompleteGoogleProfileView
            rut={controller.googleRutForm.rut}
            rutError={controller.googleRutError}
            loading={controller.googleRutLoading}
            onRutChange={(rut) =>
              controller.setGoogleRutForm((c) => ({ ...c, rut }))
            }
            onRutValidityChange={controller.handleGoogleRutValidity}
            onSubmit={controller.handleCompleteGoogleRutSubmit}
          />
        </div>
      </div>
    );
  }

  /* ── Authenticated — Main app ───────────────────────────── */
  const activePrivate = controller.activeView as PrivateView;
  const userName = controller.user ? `${controller.user.nombre[0]}` : "?";

  return (
    <div className="app-root">
      <Snackbar />

      <div className="app-layout">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-mark">b</div>
            <div>
              <div className="sidebar-brand-name">banco<em>.</em></div>
              <small className="sidebar-brand-sub">Personal · CL</small>
            </div>
          </div>

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="sidebar-section">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${activePrivate === item.id ? "active" : ""}`}
                  onClick={() => controller.setActiveView(item.id as AppView)}
                >
                  <span className="s-ico">{item.ico}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          <div className="sidebar-foot">
            <div className="sidebar-user">
              <div className="sidebar-avatar">{userName}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name" style={{ display: "block", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {controller.user?.nombre} {controller.user?.apellido}
                </span>
                <span className="sidebar-user-email" style={{ display: "block", fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {controller.user?.email}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="app-main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-crumbs">
              Personal · <b>{VIEW_LABELS[activePrivate] ?? activePrivate}</b>
            </div>
            <button
              className="topbar-icon-btn"
              onClick={() => void controller.refreshDashboard()}
              title="Actualizar datos"
            >
              <span style={{ fontSize: 13, opacity: 0.75 }}>↻</span>
              <span className="topbar-pip" />
            </button>
            <button className="btn-cta" onClick={() => void controller.refreshDashboard()}>
              + Sincronizar
            </button>
          </div>

          {/* Content */}
          <div className="content animated-rise" key={controller.activeView}>
            {renderPrivateView()}
          </div>
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="mobile-nav">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`mobile-nav-btn ${activePrivate === tab.id ? "active" : ""}`}
              onClick={() => controller.setActiveView(tab.id as AppView)}
            >
              <span style={{ fontSize: 14 }}>{tab.ico}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <ModalVisualizer />
    </div>
  );
}

export default App;
