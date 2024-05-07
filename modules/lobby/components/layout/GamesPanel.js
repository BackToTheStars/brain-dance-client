import { loadGames } from '@/modules/lobby/redux/actions';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GameRow from '../ui/GameRow';

const GamesPanel = () => {
  const dispatch = useDispatch();
  const settingsGame = useSelector((s) => s.settings.games);
  const games = useSelector((s) => s.lobby.games);

  useEffect(() => {
    dispatch(loadGames());
  }, [settingsGame]);

  return (
    <aside className="lobby-panel lobby-panel_with-bg p-2 h-full">
      <div className="flex lobby-panel__divider-b">
        <div className="flex-1">Search</div>
      </div>
      <div className="select-none">
        {games.map((game, index) => {
          return (
            <GameRow key={game._id} game={game} index={index} />
          );
        })}
      </div>
    </aside>
  );
};

export default GamesPanel;
