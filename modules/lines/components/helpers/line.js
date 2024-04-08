import { TURN_BORDER_THICKNESS } from '@/config/ui';

export const filterLinesByQuoteKeys = (lines, quoteKeys) => {
  const d = {};
  for (let key of quoteKeys) {
    d[key] = true;
  }
  return lines.filter(
    (line) =>
      d[`${line.sourceTurnId}_${line.sourceMarker}`] ||
      d[`${line.targetTurnId}_${line.targetMarker}`]
  );
};

export const filterLinesByQuoteKey = (lines, quoteKey) =>
  lines.filter(
    (line) =>
      `${line.sourceTurnId}_${line.sourceMarker}` === quoteKey ||
      `${line.targetTurnId}_${line.targetMarker}` === quoteKey
  );

export const findLineByQuoteKey = (lines, quoteKey) =>
  lines.find(
    (line) =>
      `${line.sourceTurnId}_${line.sourceMarker}` === quoteKey ||
      `${line.targetTurnId}_${line.targetMarker}` === quoteKey
  );

export const filterLinesByTurnId = (lines, turnId) =>
  lines.filter(
    (line) => line.sourceTurnId === turnId || line.targetTurnId === turnId
  );

export const getLinesCoords = (
  lines,
  turnsToRender,
  turnsDictionary,
  quotesInfo
  // pictureQuotesInfo
) => {
  // turns {_id, x, y, width, height}
  // lines {sourceTurnId, targetTurnId}

  // const turnsDictionary = {};
  // for (let turn of turns) {
  //   turnsDictionary[turn._id] = turn;
  // }

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
    let sourceCoords = {
      left: turnsDictionary[line.sourceTurnId].position.x,
      top: turnsDictionary[line.sourceTurnId].position.y,
      width: 10,
      height: 10,
    };
    let targetCoords = {
      left: turnsDictionary[line.targetTurnId].position.x,
      top: turnsDictionary[line.targetTurnId].position.y,
      width: 10,
      height: 10,
    };
    if (line.sourceMarker) {
      let sourceQuoteCoords = null;
      if (quotesInfo[line.sourceTurnId]) {
        sourceQuoteCoords = quotesInfo[line.sourceTurnId].find(
          (quote) => quote.quoteId == line.sourceMarker
        );
      }
      // if (!sourceQuoteCoords && pictureQuotesInfo[line.sourceTurnId]) {
      //   sourceQuoteCoords = pictureQuotesInfo[line.sourceTurnId].find(
      //     (quote) => quote.quoteId == line.sourceMarker
      //   );
      // }

      if (sourceQuoteCoords) {
        // если есть такая цитаты, то привязать к ней вместо шага
        sourceCoords = {
          left:
            turnsDictionary[line.sourceTurnId].position.x +
            sourceQuoteCoords.left +
            (sourceQuoteCoords.type === 'text' ? TURN_BORDER_THICKNESS : 0),
          top:
            turnsDictionary[line.sourceTurnId].position.y +
            sourceQuoteCoords.top +
            (sourceQuoteCoords.type === 'text' ? TURN_BORDER_THICKNESS : 0),
          width: sourceQuoteCoords.width,
          height: sourceQuoteCoords.height,
        };
      }
    }
    if (line.targetMarker) {
      let targetQuoteCoords = null;
      if (quotesInfo[line.targetTurnId]) {
        targetQuoteCoords = quotesInfo[line.targetTurnId].find(
          (quote) => quote.quoteId == line.targetMarker
        );
      }

      // if (!targetQuoteCoords && pictureQuotesInfo[line.targetTurnId]) {
      //   targetQuoteCoords = pictureQuotesInfo[line.targetTurnId].find(
      //     (quote) => quote.quoteId == line.targetMarker
      //   );
      // }
      if (targetQuoteCoords) {
        targetCoords = {
          left:
            turnsDictionary[line.targetTurnId].position.x +
            targetQuoteCoords.left +
            (targetQuoteCoords.type === 'text' ? TURN_BORDER_THICKNESS : 0),
          top:
            turnsDictionary[line.targetTurnId].position.y +
            targetQuoteCoords.top +
            (targetQuoteCoords.type === 'text' ? TURN_BORDER_THICKNESS : 0),
          width: targetQuoteCoords.width,
          height: targetQuoteCoords.height,
        };
      }
    }

    resLines.push({
      line, // оригиналы из базы данных
      sourceCoords,
      targetCoords,
    });
  }

  return resLines; // видимые в ViewPort линии (из базы данных), но с добавленными координатами цитат
};

export const getLineEnds = (resLines) => {
  // reslines = linesWithEndCoords, получаем концы линий в области видимости, с какими цитатами связаны эти линии
  const lineEnds = {};
  for (const resLine of resLines) {
    const { line } = resLine;
    if (line.sourceMarker) {
      const quoteKey = `${line.sourceTurnId}_${line.sourceMarker}`;
      if (!lineEnds[quoteKey]) {
        lineEnds[quoteKey] = {
          quoteKey,
          turnId: line.sourceTurnId,
          quoteId: line.sourceMarker,
          lines: [],
        };
      }
      lineEnds[quoteKey].lines.push(line);
    }
    if (line.targetMarker) {
      const quoteKey = `${line.targetTurnId}_${line.targetMarker}`; // действует с тем же именем только до {} фигурных скобок - const vs. var !!!
      if (!lineEnds[quoteKey]) {
        lineEnds[quoteKey] = {
          quoteKey,
          turnId: line.targetTurnId,
          quoteId: line.targetMarker,
          lines: [],
        };
      }
      lineEnds[quoteKey].lines.push(line);
    }
  }
  return lineEnds;
};

export const getActiveQuotesDictionary = (quotes, lines) => {
  const d = {};
  for (let quote of quotes) {
    d[quote._id] = false;
    if (findLineByQuoteKey(lines, `${quote.turnId}_${quote.quoteId}`)) {
      d[quote.quoteId] = true;
    }
  }
  return d;
};
