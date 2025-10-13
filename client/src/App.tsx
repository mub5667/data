import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import AbeerPage from "@/pages/AbeerPage";
import DataPage from "@/pages/DataPage";
import CommissionPage from "@/pages/CommissionPage";
import CommissionReportsPage from "@/pages/CommissionReportsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import AdvBillsPage from "@/pages/AdvBillsPage";
import BonusPage from "@/pages/BonusPage";
import BonusClaimedPage from "@/pages/BonusClaimedPage";
import BonusNotClaimedPage from "@/pages/BonusNotClaimedPage";
import BonusAddPage from "@/pages/BonusAddPage";
import BonusAgentsPage from "@/pages/BonusAgentsPage";
import BonusAgentDetailPage from "@/pages/BonusAgentDetailPage";
import RegistrationPage from "@/pages/RegistrationPage";
import RegistrationValApprovedPage from "@/pages/RegistrationValApprovedPage";
import RegistrationEnrollmentPage from "@/pages/RegistrationEnrollmentPage";
import RegistrationVisaProcessPage from "@/pages/RegistrationVisaProcessPage";
import RegistrationNotSubmittedPage from "@/pages/RegistrationNotSubmittedPage";
import RegistrationCancelledPage from "@/pages/RegistrationCancelledPage";
import AddStudentPage from "@/pages/AddStudentPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/abeer" component={AbeerPage} />
      <Route path="/data" component={DataPage} />
      <Route path="/commission" component={CommissionPage} />
      <Route path="/commission/reports" component={CommissionReportsPage} />
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/adv-bills" component={AdvBillsPage} />
      <Route path="/bonus" component={BonusPage} />
      <Route path="/bonus/claimed" component={BonusClaimedPage} />
      <Route path="/bonus/not-claimed" component={BonusNotClaimedPage} />
      <Route path="/bonus/add" component={BonusAddPage} />
      <Route path="/bonus/agents" component={BonusAgentsPage} />
      <Route path="/agent-bonuses/:agentSlug" component={BonusAgentDetailPage} />
      <Route path="/registration" component={RegistrationPage} />
            <Route path="/registration/val-approved" component={RegistrationValApprovedPage} />
            <Route path="/registration/enrollment" component={RegistrationEnrollmentPage} />
            <Route path="/registration/visa-process" component={RegistrationVisaProcessPage} />
            <Route path="/registration/not-submitted" component={RegistrationNotSubmittedPage} />
            <Route path="/registration/cancelled" component={RegistrationCancelledPage} />
            <Route path="/registration/add-student" component={AddStudentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto p-8">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
