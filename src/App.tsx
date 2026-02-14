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
import PaymentsPage from "./pages/reception/PaymentsPage";
import LabPaymentsPage from "./pages/reception/LabPaymentsPage";
import PatientsTodayPage from "./pages/reception/PatientsTodayPage";
import ConsultationPage from "./pages/doctor/ConsultationPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import LabResultsPage from "./pages/doctor/LabResultsPage";
import ResultDetailPage from "./pages/doctor/ResultDetailPage";
import DoctorLabRequestsPage from "./pages/doctor/DoctorLabRequestsPage";
import LabRequestsPage from "./pages/lab/LabRequestsPage";
import LabRequestDetailPage from "./pages/lab/LabRequestDetailPage";
import ImagingRequestsPage from "./pages/lab/ImagingRequestsPage";
import PatientsPage from "./pages/patients/PatientsPage";
import PharmacyStock from "./pages/pharmacy/PharmacyStock";
import PharmacyAlertsPage from "./pages/pharmacy/PharmacyAlertsPage";
import PharmacyPaymentsPage from "./pages/pharmacy/PharmacyPaymentsPage";
import PharmacyPrescriptionsPage from "./pages/pharmacy/PharmacyPrescriptionsPage";
import PharmacyPrescriptionDetailPage from "./pages/pharmacy/PharmacyPrescriptionDetailPage";
import PharmacyCategoriesPage from "./pages/pharmacy/PharmacyCategoriesPage";
import UsersPage from "./pages/admin/UsersPage";
import StatsPage from "./pages/admin/StatsPage";
import TestsPage from "./pages/admin/TestsPage";
import BedsPage from "./pages/admin/BedsPage";
import ConsultationPricePage from "./pages/admin/ConsultationPricePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Guard to block reception from accessing lab results
const LabResultsGuard = () => {
  const { user } = useAuth();
  if (user?.role === 'reception') {
    return <Navigate to="/dashboard" replace />;
  }
  return <LabRequestDetailPage />;
};

// Guard to block reception from accessing doctor lab results page
const DoctorLabResultsGuard = () => {
  const { user } = useAuth();
  if (user?.role === 'reception') {
    return <Navigate to="/dashboard" replace />;
  }
  return <LabResultsPage />;
};

// Guard to block reception from accessing patient records with lab results
const PatientsPageGuard = () => {
  const { user } = useAuth();
  if (user?.role === 'reception') {
    return <Navigate to="/dashboard" replace />;
  }
  return <PatientsPage />;
};

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
            
            {/* Change password route (accessible without dashboard layout) */}
            <Route path="/change-password" element={<ChangePasswordPage />} />
            
            {/* Protected routes with dashboard layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Reception routes */}
              <Route path="/reception" element={<Navigate to="/reception/today" replace />} />
              <Route path="/reception/today" element={<PatientsTodayPage />} />
              <Route path="/reception/register" element={<RegisterPatient />} />
              <Route path="/reception/payments" element={<PaymentsPage />} />
              <Route path="/reception/lab-payments" element={<LabPaymentsPage />} />
              <Route path="/reception/assign" element={<AssignDoctor />} />
              
              {/* Doctor routes */}
              <Route path="/doctor" element={<Navigate to="/doctor/patients" replace />} />
              <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              <Route path="/doctor/consultation" element={<ConsultationPage />} />
              <Route path="/doctor/lab-results" element={<DoctorLabResultsGuard />} />
              <Route path="/doctor/lab-results/:id" element={<ResultDetailPage />} />
              <Route path="/doctor/lab-requests" element={<DoctorLabRequestsPage />} />
              <Route path="/doctor/prescriptions" element={<ConsultationPage />} />
              
              {/* Lab routes */}
              <Route path="/lab" element={<Navigate to="/lab/requests" replace />} />
              <Route path="/lab/requests" element={<LabRequestsPage />} />
              <Route path="/lab/requests/:id" element={<LabResultsGuard />} />
              <Route path="/lab/imaging-requests" element={<ImagingRequestsPage />} />
              <Route path="/lab/pending" element={<Navigate to="/lab/requests" replace />} />
              <Route path="/lab/in-progress" element={<Navigate to="/lab/requests" replace />} />
              <Route path="/lab/results" element={<Navigate to="/lab/requests" replace />} />
              
              {/* Pharmacy routes */}
              <Route path="/pharmacy" element={<Navigate to="/pharmacy/stock" replace />} />
              <Route path="/pharmacy/stock" element={<PharmacyStock />} />
              <Route path="/pharmacy/alerts" element={<PharmacyAlertsPage />} />
              <Route path="/pharmacy/categories" element={<PharmacyCategoriesPage />} />
              <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptionsPage />} />
              <Route path="/pharmacy/prescriptions/:id" element={<PharmacyPrescriptionDetailPage />} />
              <Route path="/pharmacy/payments" element={<PharmacyPaymentsPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/stats" element={<StatsPage />} />
              <Route path="/admin/tests" element={<TestsPage />} />
              <Route path="/admin/beds" element={<BedsPage />} />
              <Route path="/admin/consultation-price" element={<ConsultationPricePage />} />
              <Route path="/admin/settings" element={<Dashboard />} />
              
              {/* Patients */}
              <Route path="/patients" element={<PatientsPageGuard />} />
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
