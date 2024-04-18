import { utils } from '@/modules/game/components/helpers/game';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import LogicLine from './LogicLine';

const QuotesLinesLayer = ({ svgLayerZIndex }) => {
  const lines = useSelector((state) => state.lines.lines);
  const svgLayer = useRef();
  const viewport = useSelector((state) => state.ui.viewport);

  useEffect(() => {
    if (!svgLayer?.current) return;

    const scrollMove = (e) => {
      const delta = Math.round(e.deltaY * 0.3);
      e.shiftKey ? utils.moveScene(2 * delta, 0) : utils.moveScene(0, delta);
    };

    svgLayer.current.addEventListener('wheel', scrollMove);
    return () => {
      svgLayer?.current?.removeEventListener('wheel', scrollMove);
    };
  }, [svgLayer?.current]);

  return (
    <>
      <svg
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        xmlns="http://www.w3.org/2000/svg"
        id="lines"
        className={svgLayerZIndex ? 'front-elements' : ''}
        ref={svgLayer}
      >
        {lines.map((line) => {
          return <LogicLine key={line._id} line={line} />
        })}
      </svg>
      {!svgLayerZIndex && (
        <div className="rec-rectangle">
          <div className="rec-label"></div>
          <div className="rec-text">
            <h4>EDIT</h4>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotesLinesLayer;
