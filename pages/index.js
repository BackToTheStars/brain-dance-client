import CreateEnterGameBlock from '@/modules/game/components/blocks/CreateEnterGameBlock';
import GameDetails from '@/modules/game/components/cards/GameDetails';

import GameTable from '@/modules/game/components/tables/GameListTable';

import { loadGames } from '@/modules/game/games-redux/actions';
import AdminMode from '@/modules/admin/components/profile/AdminMode';
import { AdminProvider } from '@/modules/admin/contexts/AdminContext';
import { useRouter } from 'next/router';

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
    <div className="container-fluid col-lg-10">
      <div className="row h-100 vh-100 game-dashboard">
        <div className="col-sm-6 col-xl-8 pt-4 game-dashboard-list">
          <AdminMode />
          <CreateEnterGameBlock
            enterGame={enterGame}
            onGameCreate={loadGamesAction}
          />
          <div style={{ overflowY: 'auto', flex: '1',  }} className='mainTableWrapper'>
            <GameTable />
          </div>
        </div>
        <div className="col-sm-6 col-xl-4 game-dashboard-detail">
          <div className="sticky-top top-4">
            <GameDetails />
            <LastTurns />
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
