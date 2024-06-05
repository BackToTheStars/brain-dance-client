'use client';

import CreateEnterGameBlock from '@/modules/game/components/blocks/CreateEnterGameBlock';
import GameDetails from '@/modules/game/components/cards/GameDetails';

import GameTable from '@/modules/game/components/tables/GameListTable';

import { AdminProvider } from '@/modules/admin/contexts/AdminContext';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import ErrorGameModal from '@/modules/game/components/modals/ErrorGameModal';

const MainDashboard = () => {
  const router = useRouter();
  const enterGame = (hash, nickname) => {
    router.push(`/code?hash=${hash}&nickname=${nickname}`);
  };
  const dispatch = useDispatch();
  const loadGamesAction = () => {}; // @deprecated

  return (
    <div className="container">
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-row flex-grow">
          <div className="w-full lg:w-2/3 p-4">
            <CreateEnterGameBlock
              enterGame={enterGame}
              onGameCreate={loadGamesAction}
            />
            <div className="flex-grow">
              <GameTable />
            </div>
          </div>
          <div className="w-full lg:w-1/3 p-4 main-dashboard__sidebar">
            <div className="sticky top-4">
              <GameDetails />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndexPage = () => {
  return (
    <AdminProvider>
      <MainDashboard />
      <ErrorGameModal />
    </AdminProvider>
  );
};

export default IndexPage;
