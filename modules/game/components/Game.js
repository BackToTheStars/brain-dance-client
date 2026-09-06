import { TURNS_GEOMETRY_TIMEOUT_DELAY } from '@/config/ui';
import {
  loadFullGame,
  loadTurnsAndLinesToPaste,
  setGameStage,
  updateViewportGeometry,
} from '@/modules/game/game-redux/actions';
import QuotesLinesLayer from '@/modules/lines/components/QuotesLinesLayer';
import { TID } from '@/config/testIds';
import Panels from '@/modules/panels/components/Panels';
import { getQueue } from '@/modules/turns/components/helpers/queueHelper';
import Turns from '@/modules/turns/components/Turns';
import {
  moveField,
  recalcAreaRect,
  resetTurnNextPastePosition,
} from '@/modules/turns/redux/actions';
import { addNotification } from '@/modules/ui/redux/actions';
import DrawLayer from '@/modules/presence/components/DrawLayer';
import GuideCursor from '@/modules/presence/components/GuideCursor';
import {
  leaveGame,
  reportViewport,
  setOnline,
} from '@/modules/presence/redux/actions';
import {
  selectFollowing,
  selectGuideSid,
} from '@/modules/presence/redux/selectors';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerMoveScene } from './helpers/game';
import {
  GAME_STAGE_ANIMATED_LOADING,
  GAME_STAGE_INIT,
  GAME_STAGE_READY,
} from '@/config/game';

const updateViewportGeometryQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);

const Game = ({ hash, focusTurnId = null, tourId = null }) => {
  const gameBox = useRef();
  const tourJoined = useRef(false);
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const stage = useSelector((state) => state.game.stage);
  const position = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);
  const following = useSelector(selectFollowing);
  const guideSid = useSelector(selectGuideSid);
  const toShowContent = useMemo(
    () => [GAME_STAGE_ANIMATED_LOADING, GAME_STAGE_READY].includes(stage),
    [stage],
  );

  const { info, reloadUserInfo } = useUserContext();
  const { nickname } = info;

  const gameBoxClasses = useMemo(() => {
    // Following exposes card contents without enabling canvas editing.
    if (following) return 'following-tour';
    return isEditMode ? 'edit-mode' : '';
  }, [isEditMode, following]);

  useEffect(() => {
    if (stage === GAME_STAGE_ANIMATED_LOADING) {
      setTimeout(() => {
        dispatch(setGameStage(GAME_STAGE_READY));
      }, 800);
    }
  }, [stage]);

  useEffect(() => {
    if (!hash) return;
    dispatch(loadFullGame(hash, { focusTurnId })).then(() => {
      dispatch(setGameStage(GAME_STAGE_ANIMATED_LOADING));
      dispatch(recalcAreaRect());
      // Пришли по ссылке-приглашению: включаем присутствие сами и подписываемся
      // на экскурсию — один раз, дальше адрес уже без параметра
      if (tourId && !tourJoined.current) {
        tourJoined.current = true;
        dispatch(setOnline(true, { reloadUserInfo, joinTour: tourId }));
      }
    });
    dispatch(
      addNotification({
        title: 'Info:',
        text: `User ${nickname} logged in.`,
      }),
    );
    return () => dispatch(setGameStage(GAME_STAGE_INIT));
  }, [hash]);

  // Уход с холста (в лобби, на другую игру) не должен оставлять соединение
  // присутствия: закрываем сокет и его панель, online снова выключен
  useEffect(() => {
    return () => dispatch(leaveGame());
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

    // A function, not a call: the listener has to outlive this effect. Calling
    // removeEventListener here took the listener off right after it was
    // added, and the window size was read once, at mount.
    return () => window.removeEventListener('resize', invokeUpdateWithQueue);
  }, []);

  // While I follow a tour the guide's minimap shows where I look: a frame on
  // every change of the canvas position or the window size, once when the
  // subscription starts and once more when the guide comes back with a new
  // sid. The thunk throttles and skips a frame equal to the previous one.
  useEffect(() => {
    dispatch(reportViewport());
  }, [
    position.x,
    position.y,
    viewport.width,
    viewport.height,
    following,
    guideSid,
  ]);

  // A follower only watches: the edit mode goes off with the subscription, and
  // a double click does not bring it back until I leave the tour.
  useEffect(() => {
    if (following) setIsEditMode(false);
  }, [following]);

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
        dispatch(recalcAreaRect());

        $(gameBox.current).css('left', 0);
        $(gameBox.current).css('top', 0);
        setTimeout(() => {
          $(gameBox.current).removeClass('remove-line-transition');
        }, 100);
      },
      cancel: '.not-draggable',
    });
    return () => $(gameBox.current).draggable('destroy');
  }, [gameBox]);

  return (
    <div className={`game-field-wrapper ${stage}`}>
      <div
        id="game-box"
        data-test-id={TID.canvas}
        className={gameBoxClasses}
        ref={gameBox}
        onDoubleClick={() => {
          if (!following) setIsEditMode((on) => !on);
        }}
      >
        {toShowContent && (
          <>
            <Turns />
            <QuotesLinesLayer />
            <GuideCursor />
            <DrawLayer />
            {isEditMode && (
              <div className="rec-rectangle">
                <div className="rec-label" />
                <h4 className="rec-text">EDIT</h4>
              </div>
            )}
          </>
        )}
      </div>
      {toShowContent && <Panels />}
    </div>
  );
};

export default Game;
