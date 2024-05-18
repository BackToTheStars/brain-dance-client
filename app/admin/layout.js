'use client';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';

const AdminLayout = ({ children }) => {
  return (
    <AdminProvider>
      <div className="admin-layout">{children}</div>
    </AdminProvider>
  );
};

export default AdminLayout;
