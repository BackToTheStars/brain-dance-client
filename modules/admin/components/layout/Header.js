'use client';

import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { notification } from 'antd';
import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import { useEffect, useMemo } from 'react';

const AdminHeader = () => {
  const router = useRouter();
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

  useEffect(() => {
    if (timeLeft === 'Token expired') {
      notification.error({
        message: 'Token expired',
      });
      logout();
      router.push('/admin/login');
    }
  }, [timeLeft]);

  return (
    <header className="relative z-10">
      <div className="absolute top-0 right-0 p-2">
        <div className="flex gap-2">
          <div>
            <Button type="link" onClick={() => router.push('/')}>
              Lobby
            </Button>
          </div>
          <div>
            <Button htmlType="button" onClick={logout}>
              Logout
            </Button>
            <span className="ml-2">{timeLeft}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
