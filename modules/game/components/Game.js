import { TURNS_GEOMETRY_TIMEOUT_DELAY } from '@/config/ui';
import {
  loadFullGame,
  loadTurnsAndLinesToPaste,
  setGameStage,
  updateViewportGeometry,
} from '@/modules/game/game-redux/actions';
import QuotesLinesLayer from '@/modules/lines/components/QuotesLinesLayer';
import Panels from '@/modules/panels/components/Panels';
import { getQueue } from '@/modules/turns/components/helpers/queueHelper';
import Turns from '@/modules/turns/components/Turns';
import {
  moveField,
  resetTurnNextPastePosition,
} from '@/modules/turns/redux/actions';
import { addNotification } from '@/modules/ui/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerMoveScene } from './helpers/game';
import { GAME_STAGE_INIT, GAME_STAGE_READY } from '@/config/game';

const updateViewportGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);

let useEffectIsDone = false;

const Game = ({ hash }) => {
  const gameBox = useRef();
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const stage = useSelector((state) => state.game.stage);

  const { info } = useUserContext();
  const { nickname } = info;

  const gameBoxClasses = useMemo(() => {
    return isEditMode ? 'edit-mode' : '';
  }, [isEditMode])

  useEffect(() => {
    if (!useEffectIsDone) {
      dispatch(loadFullGame(hash)).then(() => {
        dispatch(setGameStage(GAME_STAGE_READY));
      });
      dispatch(
        addNotification({
          title: 'Info:',
          text: `User ${nickname} logged in.`,
        }),
      );
    }
    useEffectIsDone = true;
    return () => dispatch(setGameStage(GAME_STAGE_INIT));
  }, []);

  useEffect(() => {
    if (!window) return;
    const update = () => {
      dispatch(
        updateViewportGeometry({
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    };
    const invokeUpdateWithQueue = () => {
      updateViewportGeometryQueue.add(update);
    };
    window.addEventListener('resize', invokeUpdateWithQueue);
    update();
    dispatch(loadTurnsAndLinesToPaste());

    return window.removeEventListener('resize', invokeUpdateWithQueue);
  }, []);

  useEffect(() => {
    if (!window) return;
    if (!gameBox.current) return;
    registerMoveScene(dispatch, gameBox.current);
  }, [gameBox.current]);

  useEffect(() => {
    if (!gameBox.current) return;

    if (typeof $ === 'undefined') return;

    $(gameBox.current).draggable({
      stop: (event, ui) => {
        $(gameBox.current).addClass('remove-line-transition');
        dispatch(
          moveField({
            left: -Math.round(ui.position.left),
            top: -Math.round(ui.position.top),
          }),
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
    <div className="game-field-wrapper">
      <div
        id="game-box"
        className={gameBoxClasses}
        ref={gameBox}
        onDoubleClick={(e) => setIsEditMode(!isEditMode)}
      >
        {stage === GAME_STAGE_READY && (
          <>
            <Turns />
            <QuotesLinesLayer />
            {isEditMode && (
              <div className="rec-rectangle">
                <div className="rec-label" />
                <h4 className="rec-text">EDIT</h4>
              </div>
            )}
          </>
        )}
      </div>
      {stage === GAME_STAGE_READY && <Panels />}
    </div>
  );
};

export default Game;
