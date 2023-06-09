'use client'

import AdminSigninForm from '@/modules/admin/components/forms/AdminSigninForm';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();
  return (
    <AdminProvider>
      <div
        className="container"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="col-md-2">
          <AdminSigninForm onSuccessSubmit={() => router.push('/')} />
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminPage;
