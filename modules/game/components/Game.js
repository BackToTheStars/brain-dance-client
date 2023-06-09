import { GRID_CELL_X, TURNS_GEOMETRY_TIMEOUT_DELAY } from '@/config/ui';
import {
  loadFullGame,
  loadTurnsAndLinesToPaste,
  switchEditMode,
} from '@/modules/game/game-redux/actions';
import LinesCalculator from '@/modules/lines/components/LinesCalculator';
import QuotesLinesLayer from '@/modules/lines/components/QuotesLinesLayer';
import Panels from '@/modules/panels/components/Panels';
import { resetAndExit } from '@/modules/panels/redux/actions';
import { getQueue } from '@/modules/turns/components/helpers/queueHelper';
import Turns from '@/modules/turns/components/Turns';
import {
  moveField,
  resetTurnNextPastePosition,
} from '@/modules/turns/redux/actions';
import {
  addNotification,
  viewportGeometryUpdate,
} from '@/modules/ui/redux/actions';
import { VIEWPORT_UPDATE } from '@/modules/ui/redux/types';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerMoveScene } from './helpers/game';

const viewportGeometryUpdateQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);

const Game = ({ hash }) => {
  const gameBox = useRef();
  const dispatch = useDispatch();
  const svgLayerZIndex = useSelector((state) => !state.game.editMode);
  const setSvgLayerZIndex = (booleanValue) => {
    dispatch(switchEditMode(booleanValue));
  };

  const { info } = useUserContext();
  const { nickname } = info;

  useEffect(() => {
    dispatch(loadFullGame(hash));
    dispatch(
      addNotification({ title: 'Info:', text: `User ${nickname} logged in.` })
    );
    // loadClasses();
  }, []); // token

  useEffect(() => {
    if (!window) return;
    const update = () => {
      dispatch(
        viewportGeometryUpdate({
          viewport: { width: window.innerWidth, height: window.innerHeight },
        })
      );
    };
    window.addEventListener('resize', () => {
      viewportGeometryUpdateQueue.add(update);
    });
    update();
    dispatch(loadTurnsAndLinesToPaste());
    dispatch(resetAndExit());
  }, []);

  useEffect(() => {
    if (!window) return;
    // if (!dispatch) return;
    if (!gameBox.current) return;
    registerMoveScene(dispatch, gameBox.current);
  }, [gameBox.current]);

  useEffect(() => {
    if (!gameBox.current) return;

    if (typeof $ === 'undefined') return;

    $(gameBox.current).draggable({
      // grid: [GRID_CELL_X, GRID_CELL_X],
      stop: (event, ui) => {
        $(gameBox.current).addClass('remove-line-transition');
        dispatch(
          moveField({
            left: -ui.position.left,
            top: -ui.position.top,
          })
        );

        dispatch(resetTurnNextPastePosition());

        $(gameBox.current).css('left', 0);
        $(gameBox.current).css('top', 0);
        setTimeout(() => {
          $(gameBox.current).removeClass('remove-line-transition');
        }, 100);
      },
    });
    return () => $(gameBox.current).draggable('destroy');
  }, [gameBox]);

  return (
    <div className="react-wrapper">
      <div className="gameFieldWrapper">
        <div
          id="gameBox"
          className={`ui-widget-content ${
            svgLayerZIndex ? 'hide-controls' : ''
          }`}
          ref={gameBox}
          onDoubleClick={(e) => setSvgLayerZIndex(svgLayerZIndex)}
        >
          <Turns />
          <LinesCalculator />
          <QuotesLinesLayer svgLayerZIndex={svgLayerZIndex} />
        </div>
        <Panels />
      </div>
    </div>
  );
};

export default Game;
