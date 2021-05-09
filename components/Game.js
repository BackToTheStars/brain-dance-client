import Game from '../src/game';
import { useState, useEffect, useRef } from 'react';
import ButtonsPanel from './panels/ButtonsPanel';
import ClassesPanel from './panels/ClassesPanel';
import GameInfoPanel from './panels/GameInfoPanel';
import NotificationPanel from './panels/NotificationPanel';
// import MinimapPanel from './panels/MinimapPanel';
import FlexMinimap from './panels/FlexMinimap';

import { useUserContext } from './contexts/UserContext';
import { useUiContext } from './contexts/UI_Context';
import { useTurnContext, ACTION_FIELD_WAS_MOVED } from './contexts/TurnContext';
import { API_URL } from '../src/config';
import RecPanel from './panels/RecPanel';
import TurnsComponent from './turn/Turns';
import AddEditTurnPopup from './popups/AddEditTurnPopup';

// import { TurnProvider } from './contexts/TurnContext';

// let globalGame;

const GameComponent = () => {
  const [notes, setNotes] = useState([]);
  const [game, setGame] = useState(null);
  const gameBox = useRef();
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
        // globalGame.setGameData(item);
        // globalGame.init();
      });

    $(gameBox.current).draggable({
      stop: (event, ui) => {
        //   this.saveFieldSettings({
        //     left: ui.position.left,
        //     top: ui.position.top,
        //     height: 1000,
        //     width: 1000,
        //   });
        //   this.triggers.dispatch('RECALCULATE_FIELD');
        //   this.triggers.dispatch('DRAW_LINES');
        console.log(ui.position.left, ui.position.top);
        turnsDispatch({
          type: ACTION_FIELD_WAS_MOVED,
          payload: {
            left: ui.position.left,
            top: ui.position.top,
          },
        });
        $(gameBox.current).css('left', 0);
        $(gameBox.current).css('top', 0);
      },
    });
  }, []);

  //   useEffect(() => {
  //     globalGame = new Game({
  //       stageEl: $('#gameBox'),
  //       settings: { notificationAlert },
  //       user: { info, token, can },
  //       timecode,
  //       dispatchers: {
  //         minimapDispatch,
  //         recPanelDispatch,
  //         turnsDispatch,
  //       },
  //     });
  //   }, []);

  //   useEffect(() => {
  //     globalGame.setTurnsToRender(turnsToRender);
  //   }, [turnsToRender]);

  return (
    <div className="react-wrapper">
      <ClassesPanel />
      <GameInfoPanel game={game} setGame={setGame} />
      <div className="col p0">
        <div className="gameFieldWrapper">
          <div id="gameBox" className="ui-widget-content" ref={gameBox}>
            <TurnsComponent />
          </div>
        </div>

        <ButtonsPanel />
        <NotificationPanel notes={notes} />
        <FlexMinimap gameBox={gameBox} />
        <RecPanel />

        <div className="quotes-panel" />

        {/* <div id="minimap"></div> */}
      </div>
      <AddEditTurnPopup />
    </div>
  );
};

export default GameComponent;
