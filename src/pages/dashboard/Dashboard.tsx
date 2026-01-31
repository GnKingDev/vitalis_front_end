import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import ReceptionDashboard from './ReceptionDashboard';
import DoctorDashboard from './DoctorDashboard';
import LabDashboard from './LabDashboard';
import PharmacyDashboard from './PharmacyDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'reception':
      return <ReceptionDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'lab':
      return <LabDashboard />;
    case 'pharmacy':
      return <PharmacyDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
