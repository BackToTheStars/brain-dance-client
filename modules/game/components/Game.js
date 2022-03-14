import { loadFullGame } from '@/modules/game/game-redux/actions';
import LinesCalculator from '@/modules/lines/components/LinesCalculator';
import QuotesLinesLayer from '@/modules/lines/components/QuotesLinesLayer';
import Panels from '@/modules/panels/components/Panels';
import Turns from '@/modules/turns/components/Turns';
import { moveField } from '@/modules/turns/redux/actions';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const Game = ({ hash }) => {
  const gameBox = useRef();
  const dispatch = useDispatch();
  const [svgLayerZIndex, setSvgLayerZIndex] = useState(true);

  useEffect(() => {
    dispatch(loadFullGame(hash));
    // loadClasses();
  }, []); // token

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
