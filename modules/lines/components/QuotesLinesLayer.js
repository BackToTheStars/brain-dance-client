import { utils } from '@/modules/game/components/helpers/game';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import LogicLine from './LogicLine';

const QuotesLinesLayer = () => {
  const d = useSelector((state) => state.lines.d);
  const svgLayer = useRef();
  const viewport = useSelector((state) => state.game.viewport);
  const lines = useMemo(() => Object.values(d), [d]);

  useEffect(() => {
    if (!svgLayer?.current) return;

    const scrollMove = (e) => {
      const delta = Math.round(e.deltaY * 0.3);
      e.shiftKey ? utils.moveScene(2 * delta, 0) : utils.moveScene(0, delta);
    };

    svgLayer.current.addEventListener('wheel', scrollMove, { passive: false });
    return () => {
      svgLayer?.current?.removeEventListener('wheel', scrollMove);
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
