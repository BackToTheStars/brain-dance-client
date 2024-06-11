'use client';
import withAdminPrivate from '@/modules/admin/contexts/withAdminPrivate';
import AdminLayout from '@/modules/admin/components/layout/Layout';
import AdminTabs from '@/modules/admin/components/tabs/Tabs';

const AdminPage = () => {
  return (
    <AdminLayout>
      <AdminTabs />
    </AdminLayout>
  );
};

export default withAdminPrivate(AdminPage);
