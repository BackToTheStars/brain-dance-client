'use client';

import AdminSigninForm from '@/modules/admin/components/forms/AdminSigninForm';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="col-md-2">
        <AdminSigninForm onSuccessSubmit={() => router.push('/admin')} />
      </div>
    </div>
  );
};

export default AdminPage;
