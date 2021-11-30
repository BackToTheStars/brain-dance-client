// import Game from '../src/game';
import { useState, useEffect, useRef } from 'react';
import ButtonsPanel from './panels/ButtonsPanel';
import ClassesPanel from './panels/ClassesPanel';
import GameInfoPanel from './panels/GameInfoPanel';
import NotificationPanel from './panels/NotificationPanel';
// import MinimapPanel from './panels/MinimapPanel';
import FlexMinimap from './panels/FlexMinimap';

import { useUserContext } from './contexts/UserContext';
// import { useUiContext } from './contexts/UI_Context';
import {
  useTurnContext,
  ACTION_FIELD_WAS_MOVED,
  ACTION_LINES_INIT,
} from './contexts/TurnContext';
import { API_URL } from './config';
import TurnsComponent from './turn/Turns';
import AddEditTurnPopup from './popups/AddEditTurnPopup';
import QuotesLinesLayer from './panels/QuotesLinesLayer';
import BottomPanelWrapper from './panels/BottomPanelWrapper';

// import { TurnProvider } from './contexts/TurnContext';

// let globalGame;

const GameComponent = () => {
  const [notes, setNotes] = useState([]);
  const [game, setGame] = useState(null);
  const [turnsLoaded, setTurnsLoaded] = useState(false); // @todo: refactoring
  const [svgLayerZIndex, setSvgLayerZIndex] = useState(true);
  const [authInGame, setAuthInGame] = useState(null);

  const gameBox = useRef();
  const { token, info, can, timecode, logOut } = useUserContext();
  // const {
  // minimapState: {
  // turnsToRender
  // },
  // minimapDispatch,
  // } = useUiContext();

  const { dispatch: turnsDispatch, turns } = useTurnContext();

  //   const notificationAlert = (note) => {
  //     setNotes((notes) => {
  //       return [...notes, note];
  //     });
  //   };

  useEffect(() => {
    if (!!token && authInGame === false) {
      logOut();
    }
  }, [authInGame, token]);

  useEffect(() => {
    if (!turns.length) return;
    if (turnsLoaded) return;
    setTurnsLoaded(true);

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
        setAuthInGame(item.auth);
        // linesDispatch({ type: ACTION_LINES_INIT, payload: item.redLogicLines });
        turnsDispatch({ type: ACTION_LINES_INIT, payload: item.lines });

        $(gameBox.current).animate(
          {
            left: `${-item.viewportPointX}px`,
            top: `${-item.viewportPointY}px`,
          },
          300,
          () => {
            turnsDispatch({
              type: ACTION_FIELD_WAS_MOVED,
              payload: {
                left: -item.viewportPointX,
                top: -item.viewportPointY,
              },
            });
            $(gameBox.current).css('left', 0);
            $(gameBox.current).css('top', 0);
          }
        );
      });

    !!gameBox &&
      !!gameBox.current &&
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
          $(gameBox.current).addClass('remove-line-transition');
          turnsDispatch({
            type: ACTION_FIELD_WAS_MOVED,
            payload: {
              left: ui.position.left,
              top: ui.position.top,
            },
          });
          $(gameBox.current).css('left', 0);
          $(gameBox.current).css('top', 0);
          setTimeout(() => {
            $(gameBox.current).removeClass('remove-line-transition');
          }, 100);
        },
      });

    // @todo:
    // return () => $(gameBox.current).draggable('destroy');
  }, [turns]);

  //   useEffect(() => {
  //     globalGame = new Game({
  //       stageEl: $('#gameBox'),
  //       settings: { notificationAlert },
  //       user: { info, token, can },
  //       timecode,
  //       dispatchers: {
  //         minimapDispatch,
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
          <div
            id="gameBox"
            className="ui-widget-content"
            ref={gameBox}
            onDoubleClick={(e) => setSvgLayerZIndex(!svgLayerZIndex)}
          >
            {/* <div className="doodlePic"></div> */}
            <TurnsComponent />
            <QuotesLinesLayer svgLayerZIndex={svgLayerZIndex} />
          </div>
        </div>

        <ButtonsPanel />
        <NotificationPanel notes={notes} />
        <FlexMinimap gameBox={gameBox} />
        <BottomPanelWrapper />

        {/* <div id="minimap"></div> */}
      </div>
      <AddEditTurnPopup />
    </div>
  );
};

export default GameComponent;
