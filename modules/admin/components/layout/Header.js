'use client';

import { Button, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { notification } from 'antd';
import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import { useMemo, useState } from 'react';
import { syncDatabaseRequest } from '@/modules/admin/requests';

const AdminHeader = () => {
  const router = useRouter();
  const [syncLoading, setSyncLoading] = useState(false);
  const { adminUser, logout } = useAdminContext();
  const timeLeft = useMemo(() => {
    if (adminUser?.token) {
      const parsedJwt = JSON.parse(atob(adminUser.token.split('.')[1]));
      const seconds = Math.round(parsedJwt.exp - Date.now() / 1000);
      if (seconds <= 0) {
        return 'Token expired';
      }
      const formatedDaysAndTime = `${Math.floor(seconds / 86400)}d ${Math.floor(
        (seconds % 86400) / 3600,
      )}h ${Math.floor((seconds % 3600) / 60)}m`;
      return `Expires in ${formatedDaysAndTime}`;
    }
    return null;
  }, [adminUser?.token]);
  const syncDatabase = async () => {
    setSyncLoading(true);
    const { success } = await syncDatabaseRequest();
    setSyncLoading(false);
    if (success) {
      notification.success({
        message: 'Database synced',
      });
    } else {
      notification.error({
        message: 'Failed to sync database',
      });
    }
  };

  return (
    <header className="p-2">
      <div className="flex gap-2">
        <div>
          <Button type="link" onClick={() => router.push('/')}>
            Lobby
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Button htmlType="button" onClick={syncDatabase}>
            Sync Database
          </Button>
          {syncLoading && <Spin />}
        </div>
        <div className="flex-1" />
        <div>
          <Button htmlType="button" onClick={logout}>
            Logout
          </Button>
          <span className="ml-2">{timeLeft}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
