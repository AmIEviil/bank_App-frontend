import "./App.css";
import { useFinanceAppController } from "./hooks/useFinanceAppController";
import { TabNav } from "./components/ui/TabNav";
import { Button } from "./components/ui/Button";
import { Snackbar } from "./components/ui/Snackbar";
import { LoginView } from "./components/views/auth/LoginView";
import { CreateAccountView } from "./components/views/auth/CreateAccountView";
import { ForgotPasswordView } from "./components/views/auth/ForgotPasswordView";
import { ResetPasswordView } from "./components/views/auth/ResetPasswordView";
import { InicioView } from "./components/views/private/InicioView";
import { MovimientosView } from "./components/views/private/MovimientosView";
import { MetricasView } from "./components/views/private/MetricasView";
import { ResumenView } from "./components/views/private/ResumenView";
import { TarjetaCreditoView } from "./components/views/private/TarjetaCreditoView";
import { ConfiguracionView } from "./components/views/private/ConfiguracionView";
import type { AppView } from "./types/view.types";

function App() {
  const controller = useFinanceAppController();

  const renderAuthView = () => {
    if (controller.activeView === "login") {
      return (
        <LoginView
          email={controller.loginForm.email}
          password={controller.loginForm.password}
          loading={controller.authLoading}
          onSubmit={controller.handleLoginSubmit}
          onEmailChange={(email) =>
            controller.setLoginForm((current) => ({ ...current, email }))
          }
          onPasswordChange={(password) =>
            controller.setLoginForm((current) => ({ ...current, password }))
          }
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
            controller.setRegisterForm((current) => ({
              ...current,
              [field]: value,
            }))
          }
          onRutValidityChange={controller.handleRegisterRutValidity}
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
        />
      );
    }

    return (
      <ResetPasswordView
        form={controller.resetForm}
        loading={controller.authLoading}
        onSubmit={controller.handleResetSubmit}
        onChange={(field, value) =>
          controller.setResetForm((current) => ({
            ...current,
            [field]: value,
          }))
        }
      />
    );
  };

  const renderPrivateView = () => {
    if (
      controller.dashboardLoading &&
      controller.activeView !== "configuracion"
    ) {
      return <div className="panel">Cargando datos del dashboard...</div>;
    }

    if (controller.activeView === "inicio") {
      return (
        <InicioView
          userName={controller.user?.nombre || ""}
          metrics={controller.metrics}
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
        />
      );
    }

    if (controller.activeView === "metricas") {
      return (
        <MetricasView
          metrics={controller.metrics}
          resumen={controller.resumen}
          categoryMax={controller.categoryMax}
        />
      );
    }

    if (controller.activeView === "tarjeta-credito") {
      return <TarjetaCreditoView overview={controller.creditCardOverview} />;
    }

    if (controller.activeView === "resumen") {
      return (
        <ResumenView
          resumen={controller.resumen}
          sourceMax={controller.sourceMax}
        />
      );
    }

    return (
      <ConfiguracionView
        syncForm={controller.syncForm}
        rutError={controller.rutError}
        syncLoading={controller.syncLoading}
        scrapedMovements={controller.scrapedMovements}
        onRutChange={(rut) =>
          controller.setSyncForm((current) => ({
            ...current,
            rut,
          }))
        }
        onRutValidityChange={controller.handleRutValidity}
        onPasswordChange={(password) =>
          controller.setSyncForm((current) => ({
            ...current,
            password,
          }))
        }
        onSync={controller.handleStartSync}
        onFetchScraping={controller.handleFetchScrapedData}
        onLogout={controller.handleLogout}
      />
    );
  };

  return (
    <div className="app-root">
      <div className="ambient-gradient" />
      <div className="ambient-grid" />

      <div className="app-shell">
        <header className="topbar panel">
          <div>
            <p className="eyebrow">Personal Finance Hub</p>
            <h1>Bank App</h1>
          </div>
          {controller.user ? (
            <div className="user-chip">
              <span>{`${controller.user.nombre} ${controller.user.apellido}`}</span>
              <small>{controller.user.email}</small>
            </div>
          ) : (
            <small className="subtitle">Autenticacion segura con JWT</small>
          )}
        </header>

        <Snackbar />

        {controller.isAuthenticated ? (
          <>
            <TabNav
              privateMode
              options={controller.privateTabs}
              active={controller.activeView}
              onChange={(value) => controller.setActiveView(value as AppView)}
              extra={
                <Button
                  type="button"
                  className="refresh-btn"
                  variant="primary"
                  onClick={() => {
                    void controller.refreshDashboard();
                  }}
                >
                  Actualizar datos
                </Button>
              }
            />
            {renderPrivateView()}
          </>
        ) : (
          <>
            <TabNav
              options={controller.authTabs}
              active={controller.activeView}
              onChange={(value) => controller.setActiveView(value as AppView)}
            />
            {renderAuthView()}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
