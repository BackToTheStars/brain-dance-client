import { useState } from 'react';
import AdminGamesTable from '../games/Table';
import AdminGameDetails from '../games/Details';

const GamesTab = () => {
  const [activeGame, setActiveGame] = useState(null);
  return (
    <div className="flex gap-2">
      <div className="w-1/2">
        <AdminGamesTable onDetailsClick={setActiveGame} />
      </div>
      <div className="w-1/2">
        {!!activeGame && <AdminGameDetails game={activeGame} />}
      </div>
    </div>
  );
};

export default GamesTab;