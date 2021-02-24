import Game from '../src/game';
import { useState, useEffect } from 'react';
import ButtonsPanel from './panels/ButtonsPanel';
import ClassesPanel from './panels/ClassesPanel';
import GameInfoPanel from './panels/GameInfoPanel';
import NotificationPanel from './panels/NotificationPanel';
import MinimapPanel from './panels/MinimapPanel';
import { useUserContext } from './contexts/UserContext';
import { API_URL } from '../src/config';

const GameComponent = () => {
  const [notes, setNotes] = useState([]);
  const [game, setGame] = useState(null);
  const { token, info, can } = useUserContext();

  const notificationAlert = (note) => {
    setNotes((notes) => {
      return [...notes, note];
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/game?hash=${info.hash}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'game-token': token,
      },
    })
      .then((data) => data.json())
      .then(({ item }) => setGame(item));
  }, []);

  useEffect(() => {
    const game = new Game({
      stageEl: $('#gameBox'),
      settings: { notificationAlert },
      user: { info, token, can },
    });
    game.init();
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <ClassesPanel />

      <GameInfoPanel game={game} />
      <div className="col p0">
        <div className="gameFieldWrapper">
          <div id="gameBox" className="ui-widget-content" />
        </div>

        <ButtonsPanel />
        <NotificationPanel notes={notes} />
        <MinimapPanel />

        <div className="quotes-panel" />

        {/* <div id="minimap"></div> */}
      </div>
    </div>
  );
};

export default GameComponent;
