'use client';
import '@/themes/game/index.scss';

import CreateEnterGameBlock from '@/modules/game/components/blocks/CreateEnterGameBlock';
import GameDetails from '@/modules/game/components/cards/GameDetails';

import GameTable from '@/modules/game/components/tables/GameListTable';

import { loadGames } from '@/modules/game/games-redux/actions';
import AdminMode from '@/modules/admin/components/profile/AdminMode';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';
import { useRouter } from 'next/navigation';

import { useDispatch } from 'react-redux';
import ErrorGameModal from '@/modules/game/components/modals/ErrorGameModal';
import LastTurns from '@/modules/game/components/blocks/LastTurns';

const MainDashboard = () => {
  const router = useRouter();
  const enterGame = (hash, nickname) => {
    router.push(`/code?hash=${hash}&nickname=${nickname}`);
  };
  const dispatch = useDispatch();
  const loadGamesAction = () => dispatch(loadGames());

  return (
    <div className="container">
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-row flex-grow">
          <div className="w-full lg:w-2/3 p-4">
            <AdminMode />
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
              <LastTurns />
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
