'use client';

import AdminSigninForm from '@/modules/admin/components/forms/AdminSigninForm';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();
  return (
    <div className="admin-layout flex-center all-full">
      <AdminSigninForm onSuccessSubmit={() => router.push('/admin')} />
    </div>
  );
};

export default AdminPage;
