import { useTurnContext } from '../contexts/TurnContext';
import { useRef, useState } from 'react';

const QuotesLinesLayer = () => {
  const svgLayer = useRef();
  const [svgLayerZIndex, setSvgLayerZIndex] = useState(false);

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  const { linesState } = useTurnContext();
  const { lines } = linesState;
  // console.log(lines);
  // turns {_id, x, y, width, height}
  // lines {sourceTurnId, sourceMarker, targetTurnId, targetMarker}

  return (
    <>
      <svg
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        id="lines"
        className={svgLayerZIndex ? 'front-elements' : ''}
        onDoubleClick={(e) => setSvgLayerZIndex(!svgLayerZIndex)}
        ref={svgLayer}
      ></svg>
      {!svgLayerZIndex && (
        <div>
          <div className="rec-label"></div>
          <div className="rec-text">
            <h2>EDIT</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotesLinesLayer;
