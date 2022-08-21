// import {
//   useInteractionContext,
//   MODE_GAME,
// } from '../contexts/InteractionContext';
// import { useTurnsCollectionContext } from '../contexts/TurnsCollectionContext';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Line from './Line';
// import { useUiContext } from '../contexts/UI_Context';

const QuotesLinesLayer = ({ svgLayerZIndex }) => {
  const svgLayer = useRef();

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  // const { linesWithEndCoords } = useTurnsCollectionContext();
  const linesWithEndCoords = useSelector(
    (state) => state.lines.linesWithEndCoords
  );

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
            <h4>EDIT</h4>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotesLinesLayer;