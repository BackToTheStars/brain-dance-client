import Game from '../src/game';
import { useState, useEffect } from 'react';
import ButtonsPanel from './panels/ButtonsPanel';
import ClassesPanel from './panels/ClassesPanel';
import GameInfoPanel from './panels/GameInfoPanel';
import NotificationPanel from './panels/NotificationPanel';
// import MinimapPanel from './panels/MinimapPanel';
import FlexMinimap from './panels/FlexMinimap';

import { useUserContext } from './contexts/UserContext';
import { useUiContext } from './contexts/UI_Context';
import { useTurnContext } from './contexts/TurnContext';
import { API_URL } from '../src/config';
import RecPanel from './panels/RecPanel';
import TurnsComponent from './Turns';
// import { TurnProvider } from './contexts/TurnContext';

let globalGame;

const GameComponent = () => {
  const [notes, setNotes] = useState([]);
  const [game, setGame] = useState(null);
  const { token, info, can, timecode } = useUserContext();
  const {
    minimapState: { turnsToRender },
    minimapDispatch,
    recPanelDispatch,
  } = useUiContext();
  const turnContext = useTurnContext();
  const turnsDispatch = turnContext ? turnContext.dispatch : () => {};

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
      .then(({ item }) => {
        setGame(item);
        globalGame.setGameData(item);
        globalGame.init();
      });
  }, []);

  useEffect(() => {
    globalGame = new Game({
      stageEl: $('#gameBox'),
      settings: { notificationAlert },
      user: { info, token, can },
      timecode,
      dispatchers: {
        minimapDispatch,
        recPanelDispatch,
        turnsDispatch,
      },
    });
  }, []);

  useEffect(() => {
    globalGame.setTurnsToRender(turnsToRender);
  }, [turnsToRender]);

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <ClassesPanel />

      <GameInfoPanel game={game} setGame={setGame} />
      <div className="col p0">
        <div className="gameFieldWrapper">
          <div id="gameBox" className="ui-widget-content">
            <TurnsComponent />
          </div>
        </div>

        <ButtonsPanel />
        <NotificationPanel notes={notes} />
        <FlexMinimap />
        <RecPanel />

        <div className="quotes-panel" />

        {/* <div id="minimap"></div> */}
      </div>
    </div>
  );
};

export default GameComponent;
