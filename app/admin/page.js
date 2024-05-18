'use client';
import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import withAdminPrivate from '@/modules/admin/contexts/withAdminPrivate';
import { syncDatabaseRequest } from '@/modules/admin/requests';
import { Button, Spin } from 'antd';
import { useState } from 'react';
import { notification } from 'antd';

const AdminPage = () => {
  const { logout } = useAdminContext();
  const [syncLoading, setSyncLoading] = useState(false);

  const syncDatabase = async () => {
    setSyncLoading(true);
    const { success } = await syncDatabaseRequest();
    setSyncLoading(false);
    if (success) {
      notification.success({
        message: 'Database synced',
      })
    } else {
      notification.error({
        message: 'Failed to sync database',
      });
    }
  };
  return (
    <div className="container mx-auto">
      <header className="p-4">
        <Button htmlType="button" onClick={logout}>
          Logout
        </Button>
      </header>
      <main className="p-4">
        <hr className="my-2" />
        <p>Actions</p>
        <div className="flex gap-2 mt-3 items-center">
          <Button htmlType="button" onClick={syncDatabase}>
            Sync Database
          </Button>
          {syncLoading && <Spin />}
        </div>
        <hr className="my-2" />
        <p>Links</p>
        <Button type="link" href="/">Lobby</Button>
      </main>
    </div>
  );
};

export default withAdminPrivate(AdminPage);
