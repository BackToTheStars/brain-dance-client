import { utils } from '@/modules/game/components/helpers/game';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import LogicLine from './LogicLine';
import { TID } from '@/config/testIds';

const QuotesLinesLayer = () => {
  const d = useSelector((state) => state.lines.d);
  const svgLayer = useRef();
  const store = useStore();
  const viewport = useSelector((state) => state.game.viewport);
  const lines = useMemo(() => Object.values(d), [d]);

  useEffect(() => {
    if (!svgLayer?.current) return;

    const scrollMove = (e) => {
      // canvas px: under the zoom the board follows the wheel 1:1 on screen
      const delta = Math.round((e.deltaY * 0.3) / store.getState().game.zoom);
      e.shiftKey ? utils.moveScene(2 * delta, 0) : utils.moveScene(0, delta);
    };

    // Where this layer lets the pointer through, the canvas itself becomes the
    // wheel target; the guard keeps a wheel over a card from moving the board.
    const box = svgLayer.current.parentNode;
    const scrollMoveOnCanvas = (e) => {
      if (e.target === box) scrollMove(e);
    };

    svgLayer.current.addEventListener('wheel', scrollMove, { passive: false });
    box.addEventListener('wheel', scrollMoveOnCanvas, { passive: false });
    return () => {
      svgLayer?.current?.removeEventListener('wheel', scrollMove);
      box.removeEventListener('wheel', scrollMoveOnCanvas);
    };
  }, [svgLayer?.current]);

  const { viewBox, styles } = useMemo(() => {
    return {
      viewBox: `0 0 ${viewport.width * 3} ${viewport.height * 3}`,
      styles: {
        width: `${viewport.width * 3}px`,
        height: `${viewport.height * 3}px`,
        left: `${-viewport.width}px`,
        top: `${-viewport.height}px`,
      },
    };
  }, [viewport]);

  return (
    <>
      <svg
        viewBox={viewBox}
        style={styles}
        xmlns="http://www.w3.org/2000/svg"
        id="lines"
        data-test-id={TID.canvasLines}
        ref={svgLayer}
      >
        {lines.map((line) => {
          return <LogicLine key={line._id} id={line._id} />;
        })}
      </svg>
    </>
  );
};

export default QuotesLinesLayer;
