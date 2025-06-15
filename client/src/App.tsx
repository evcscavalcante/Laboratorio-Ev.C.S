import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

import { DataSyncProvider } from "@/contexts/data-sync-context";
import MainLayout from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard-simplified";
import Analytics from "@/pages/analytics";
import Login from "@/pages/login";
import SubscriptionPage from "@/pages/subscription";

import SolosPage from "@/pages/solos";
import DensidadeInSituPage from "@/pages/solos/densidade-in-situ";
import DensidadeRealPage from "@/pages/solos/densidade-real";
import DensidadeMaxMinPage from "@/pages/solos/densidade-max-min";
import BalancaVerificacao from "@/pages/balanca-verificacao";
import Configuracoes from "@/pages/configuracoes";
import Relatorios from "@/pages/relatorios";
import EquipamentosFixed from "@/pages/equipamentos-fixed";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import UserRoles from "@/pages/admin/user-roles";
import OrganizationManagement from "@/pages/admin/organization-management";
import ManualUsuario from "@/pages/help/manual-usuario";
import ManualAdmin from "@/pages/help/manual-admin";
import TestAccess from "@/pages/test-access";
import UserCreation from "@/pages/admin/user-creation";
import SystemStatus from "@/pages/system-status";
import SystemMonitoring from "@/pages/system-monitoring";
import EnsaiosSalvos from "@/pages/ensaios-salvos";
import TermosUso from "@/pages/termos-uso";
import ConfiguracoesLGPD from "@/pages/configuracoes-lgpd";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/subscription" component={SubscriptionPage} />

        <Route path="/solos" component={SolosPage} />
        <Route path="/densidade-in-situ" component={DensidadeInSituPage} />
        <Route path="/densidade-real" component={DensidadeRealPage} />
        <Route path="/densidade-max-min" component={DensidadeMaxMinPage} />
        <Route path="/balanca-verificacao" component={BalancaVerificacao} />
        <Route path="/equipamentos" component={EquipamentosFixed} />
        <Route path="/ensaios-salvos" component={EnsaiosSalvos} />
        <Route path="/configuracoes" component={Configuracoes} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin/user-roles" component={UserRoles} />
        <Route path="/admin/organizations" component={OrganizationManagement} />
        <Route path="/admin/create-user" component={UserCreation} />
        <Route path="/help/manual-usuario" component={ManualUsuario} />
        <Route path="/help/manual-admin" component={ManualAdmin} />
        <Route path="/test-access" component={TestAccess} />
        <Route path="/system-status" component={SystemStatus} />
        <Route path="/system-monitoring" component={SystemMonitoring} />
        <Route path="/termos-uso" component={TermosUso} />
        <Route path="/configuracoes-lgpd" component={ConfiguracoesLGPD} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataSyncProvider>
          <Router />
        </DataSyncProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
