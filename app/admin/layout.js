'use client';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';

const AdminLayout = ({ children }) => {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
};

export default AdminLayout;
