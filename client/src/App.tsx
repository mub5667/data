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
import IncomeOutcomePage from "@/pages/IncomeOutcomePage";
import DataPage from "@/pages/DataPage";
import CommissionPage from "@/pages/CommissionPage";
import CommissionReportsPage from "@/pages/CommissionReportsPage";
import InvoicesPage from "@/pages/InvoicesPage";
import SentInvoicesPage from "@/pages/SentInvoicesPage";
import UcsiPage from "@/pages/UcsiPage";
import UcsiInvoicesPage from "@/pages/UcsiInvoicesPage";
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
import EventsPage from "@/pages/EventsPage";
import SalariesPage from "@/pages/SalariesPage";
import ServicesPage from "@/pages/ServicesPage";
import ProcedureReceivingStudentPage from "@/pages/ProcedureReceivingStudentPage";
import OfficePage from "@/pages/OfficePage";
import TripTravelBonusPage from "@/pages/TripTravelBonusPage";
import EmployeeVisaPage from "@/pages/EmployeeVisaPage";
import MoneyTransferPage from "@/pages/MoneyTransferPage";
import SubagentPage from "@/pages/SubagentPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/abeer" component={AbeerPage} />
      <Route path="/income-outcome" component={IncomeOutcomePage} />
      <Route path="/data" component={DataPage} />
      <Route path="/commission" component={CommissionPage} />
      <Route path="/commission/reports" component={CommissionReportsPage} />
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/invoices/sent" component={SentInvoicesPage} />
      <Route path="/invoices/ucsi" component={UcsiPage} />
      <Route path="/invoices/ucsi-invoices" component={UcsiInvoicesPage} />
      <Route path="/adv-bills" component={AdvBillsPage} />
      <Route path="/adv-bills/subagent" component={SubagentPage} />
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
      <Route path="/abeer/events" component={EventsPage} />
      <Route path="/abeer/salaries" component={SalariesPage} />
      <Route path="/abeer/service" component={ServicesPage} />
      <Route path="/abeer/procedure-receiving-student" component={ProcedureReceivingStudentPage} />
      <Route path="/abeer/office" component={OfficePage} />
      <Route path="/abeer/trip-travel-bonus" component={TripTravelBonusPage} />
      <Route path="/abeer/employee-visa" component={EmployeeVisaPage} />
      <Route path="/abeer/money-transfer" component={MoneyTransferPage} />
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
            <div className="flex flex-col flex-1 min-w-0">
              <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" aria-label="Toggle menu" />
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
                <div className="mx-auto w-full max-w-[1600px]">
                  <Router />
                </div>
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
