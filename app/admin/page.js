'use client';
import withAdminPrivate from '@/modules/admin/contexts/withAdminPrivate';
import { useState } from 'react';
import AdminGamesTable from '@/modules/admin/components/games/Table';
import AdminGameDetails from '@/modules/admin/components/games/Details';
import AdminHeader from '@/modules/admin/components/layout/Header';

const AdminPage = () => {
  const [activeGame, setActiveGame] = useState(null);
  return (
    <div className="container mx-auto">
      <AdminHeader />
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
