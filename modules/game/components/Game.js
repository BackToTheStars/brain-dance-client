import { TURNS_GEOMETRY_TIMEOUT_DELAY } from '@/config/ui';
import { loadFullGame } from '@/modules/game/game-redux/actions';
import LinesCalculator from '@/modules/lines/components/LinesCalculator';
import QuotesLinesLayer from '@/modules/lines/components/QuotesLinesLayer';
import Panels from '@/modules/panels/components/Panels';
import { getQueue } from '@/modules/turns/components/helpers/queueHelper';
import Turns from '@/modules/turns/components/Turns';
import { moveField } from '@/modules/turns/redux/actions';
import {
  addNotification,
  viewportGeometryUpdate,
} from '@/modules/ui/redux/actions';
import { VIEWPORT_UPDATE } from '@/modules/ui/redux/types';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const viewportGeometryUpdateQueue = getQueue(TURNS_GEOMETRY_TIMEOUT_DELAY);

const Game = ({ hash }) => {
  const gameBox = useRef();
  const dispatch = useDispatch();
  const [svgLayerZIndex, setSvgLayerZIndex] = useState(true);

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
  }, []);

  useEffect(() => {
    if (!gameBox.current) return;
    $(gameBox.current).draggable({
      stop: (event, ui) => {
        $(gameBox.current).addClass('remove-line-transition');
        dispatch(
          moveField({
            left: -ui.position.left,
            top: -ui.position.top,
          })
        );
        // dispatch(ACTION_FIELD_WAS_MOVED, {
        //   left: ui.position.left,
        //   top: ui.position.top,
        // });
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
          className="ui-widget-content"
          ref={gameBox}
          onDoubleClick={(e) => setSvgLayerZIndex(!svgLayerZIndex)}
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
