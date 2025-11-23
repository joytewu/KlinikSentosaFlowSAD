import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClinicProvider } from "@/lib/store";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

import AuthPage from "@/pages/Auth";
import ReceptionPage from "@/pages/Reception";
import DoctorPage from "@/pages/Doctor";
import PaymentPage from "@/pages/Payment";
import AdminPage from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      
      <Route path="/reception">
        <Layout>
          <ReceptionPage />
        </Layout>
      </Route>
      
      <Route path="/doctor">
        <Layout>
          <DoctorPage />
        </Layout>
      </Route>
      
      <Route path="/payment">
        <Layout>
          <PaymentPage />
        </Layout>
      </Route>
      
      <Route path="/admin">
        <Layout>
          <AdminPage />
        </Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClinicProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ClinicProvider>
    </QueryClientProvider>
  );
}

export default App;
