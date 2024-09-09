'use client';

import withAdminPrivate from '@/modules/admin/contexts/withAdminPrivate';
import AdminLayout from '@/modules/admin/components/layout/Layout';
import TurnDetail from '@/modules/admin/components/turns/Detail';

const AdminTurnPage = () => {
  return (
    <AdminLayout>
      <TurnDetail />
    </AdminLayout>
  );
};

export default withAdminPrivate(AdminTurnPage);
