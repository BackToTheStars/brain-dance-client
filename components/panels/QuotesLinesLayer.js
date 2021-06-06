import { useTurnContext } from '../contexts/TurnContext';
import { useRef, useState } from 'react';
import Line from '../line/line';
import { useUiContext } from '../contexts/UI_Context';

const getLinesCoords = (lines, turns, turnsToRender) => {
  // turns {_id, x, y, width, height}
  // lines {sourceTurnId, targetTurnId}

  const turnsDictionary = {};
  for (let turn of turns) {
    turnsDictionary[turn._id] = turn;
  }

  const turnsToRenderDictionary = {};
  for (let turn of turnsToRender) {
    turnsToRenderDictionary[turn] = true;
  }

  const resLines = [];
  for (let line of lines) {
    if (
      !turnsToRenderDictionary[line.sourceTurnId] &&
      !turnsToRenderDictionary[line.targetTurnId]
    ) {
      continue;
    }
    resLines.push({
      sourceCoords: {
        left: turnsDictionary[line.sourceTurnId].x,
        top: turnsDictionary[line.sourceTurnId].y,
        width: 10,
        height: 10,
      },
      targetCoords: {
        left: turnsDictionary[line.targetTurnId].x,
        top: turnsDictionary[line.targetTurnId].y,
        width: 10,
        height: 10,
      },
    });
  }

  return resLines;

  // const turnCentersDictionary = {};
  // for (let turn of turns) {
  //   turnCentersDictionary[turn._id] = {
  //     x: Math.floor(turn.x + turn.width / 2),
  //     y: Math.floor(turn.y + turn.height / 2),
  //   };
  // }

  // const resLines = [];
  // for (let line of lines) {
  //   if (line.sourceTurnId === line.targetTurnId) {
  //     continue;
  //   }
  //   if (!turnCentersDictionary[line.sourceTurnId]) {
  //     console.log(`Нет исходного шага у линии ${line._id}`);
  //     continue;
  //   }
  //   if (!turnCentersDictionary[line.targetTurnId]) {
  //     console.log(`Нет целевого шага у линии ${line._id}`);
  //     continue;
  //   }

  //   resLines.push({
  //     id: line._id,
  //     x1: turnCentersDictionary[line.sourceTurnId].x,
  //     y1: turnCentersDictionary[line.sourceTurnId].y,
  //     x2: turnCentersDictionary[line.targetTurnId].x,
  //     y2: turnCentersDictionary[line.targetTurnId].y,
  //   });
  // }
  // return resLines;
};

const QuotesLinesLayer = () => {
  const svgLayer = useRef();
  const [svgLayerZIndex, setSvgLayerZIndex] = useState(false);

  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  const { lines, turns } = useTurnContext();
  const {
    minimapState: { turnsToRender },
  } = useUiContext();

  console.log({
    lines,
    turns,
    turnsToRender,
  });

  const resLines = getLinesCoords(lines, turns, turnsToRender);
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
      >
        {resLines.map((line) => {
          return (
            <Line
              sourceCoords={line.sourceCoords}
              targetCoords={line.targetCoords}
            />
          );
        })}
      </svg>
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
