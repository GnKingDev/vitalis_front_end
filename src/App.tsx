import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import RegisterPatient from "./pages/reception/RegisterPatient";
import AssignDoctor from "./pages/reception/AssignDoctor";
import ConsultationPage from "./pages/doctor/ConsultationPage";
import PatientsPage from "./pages/patients/PatientsPage";
import PharmacyStock from "./pages/pharmacy/PharmacyStock";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Protected routes with dashboard layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Reception routes */}
              <Route path="/reception" element={<Navigate to="/reception/today" replace />} />
              <Route path="/reception/today" element={<Dashboard />} />
              <Route path="/reception/register" element={<RegisterPatient />} />
              <Route path="/reception/payments" element={<Dashboard />} />
              <Route path="/reception/assign" element={<AssignDoctor />} />
              
              {/* Doctor routes */}
              <Route path="/doctor" element={<Navigate to="/doctor/patients" replace />} />
              <Route path="/doctor/patients" element={<Dashboard />} />
              <Route path="/doctor/consultation" element={<ConsultationPage />} />
              <Route path="/doctor/lab-requests" element={<ConsultationPage />} />
              <Route path="/doctor/prescriptions" element={<ConsultationPage />} />
              
              {/* Lab routes */}
              <Route path="/lab" element={<Navigate to="/lab/pending" replace />} />
              <Route path="/lab/pending" element={<Dashboard />} />
              <Route path="/lab/in-progress" element={<Dashboard />} />
              <Route path="/lab/results" element={<Dashboard />} />
              
              {/* Pharmacy routes */}
              <Route path="/pharmacy" element={<Navigate to="/pharmacy/stock" replace />} />
              <Route path="/pharmacy/stock" element={<PharmacyStock />} />
              <Route path="/pharmacy/alerts" element={<PharmacyStock />} />
              <Route path="/pharmacy/prescriptions" element={<Dashboard />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<Dashboard />} />
              <Route path="/admin/stats" element={<Dashboard />} />
              <Route path="/admin/settings" element={<Dashboard />} />
              
              {/* Patients */}
              <Route path="/patients" element={<PatientsPage />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
