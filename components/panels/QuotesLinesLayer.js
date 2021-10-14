import { useMainContext } from '../contexts/MainContext';
import { useTurnContext } from '../contexts/TurnContext';
import { useRef, useState } from 'react';
import Line from '../line/line';
import { useUiContext } from '../contexts/UI_Context';

const QuotesLinesLayer = ({ svgLayerZIndex }) => {
  const svgLayer = useRef();

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  const { linesWithEndCoords } = useTurnContext();
  const { makeWidgetActive } = useMainContext();

  // turns {_id, x, y, width, height}
  // lines {sourceTurnId, sourceMarker, targetTurnId, targetMarker}

  return (
    <>
      <svg
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        id="lines"
        className={svgLayerZIndex ? 'front-elements' : ''}
        ref={svgLayer}
        onClick={(e) => {
          makeWidgetActive(null);
        }}
      >
        {linesWithEndCoords.map((line, i) => {
          return (
            <Line
              key={line.line._id}
              sourceCoords={line.sourceCoords}
              targetCoords={line.targetCoords}
            />
          );
        })}
      </svg>
      {!svgLayerZIndex && (
        <div className="rec-rectangle">
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
