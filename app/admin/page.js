'use client';
import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import withAdminPrivate from '@/modules/admin/contexts/withAdminPrivate';
import { syncDatabaseRequest } from '@/modules/admin/requests';
import { Button, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { notification } from 'antd';
import AdminGamesTable from '@/modules/admin/components/games/Table';
import AdminGameDetails from '@/modules/admin/components/games/Details';

const AdminPage = () => {
  const { adminUser, logout } = useAdminContext();
  const [syncLoading, setSyncLoading] = useState(false);
  const [activeGame, setActiveGame] = useState(null);

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
    <div className="container mx-auto">
      <header className="p-2">
        <div className="flex gap-2">
          <div>
            <Button
              type="link"
              onClick={() => router.push('/')}
            >
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
      <main className="p-2">
        <div className="flex gap-2">
          <div className="w-1/2">
            <AdminGamesTable onDetailsClick={setActiveGame} />
          </div>
          <div className="w-1/2">
            {!!activeGame && <AdminGameDetails game={activeGame} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default withAdminPrivate(AdminPage);
