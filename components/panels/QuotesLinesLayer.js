import {
  useInteractionContext,
  MODE_GAME,
} from '../contexts/InteractionContext';
import { useTurnContext } from '../contexts/TurnContext';
import { useRef, useState } from 'react';
import Line from '../line/line';
import { useUiContext } from '../contexts/UI_Context';

const QuotesLinesLayer = ({ svgLayerZIndex }) => {
  const svgLayer = useRef();

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  const { linesWithEndCoords } = useTurnContext();
  const { makeWidgetActive, setInteractionMode } = useInteractionContext();

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
          setInteractionMode(MODE_GAME);
        }}
      >
        {linesWithEndCoords.map((lineWithEndCoords) => {
          // console.log(lineWithEndCoords.line._id);
          return (
            <Line
              key={lineWithEndCoords.line._id}
              sourceCoords={lineWithEndCoords.sourceCoords}
              targetCoords={lineWithEndCoords.targetCoords}
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
