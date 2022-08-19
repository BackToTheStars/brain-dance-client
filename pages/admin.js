import AdminSigninForm from '@/modules/admin/components/forms/AdminSigninForm';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';
import { useRouter } from 'next/router';

const AdminPage = () => {
  const router = useRouter();
  return (
    <AdminProvider>
      <div className="container">
        <div className="row">
          <div className="col-md-4 offset-md-4">
            <AdminSigninForm onSuccessSubmit={() => router.push('/')} />
          </div>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminPage;
