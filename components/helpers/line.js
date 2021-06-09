export const getLinesCoords = (lines, turns, turnsToRender, quoteCoords) => {
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
    let sourceCoords = {
      left: turnsDictionary[line.sourceTurnId].x,
      top: turnsDictionary[line.sourceTurnId].y,
      width: 10,
      height: 10,
    };
    let targetCoords = {
      left: turnsDictionary[line.targetTurnId].x,
      top: turnsDictionary[line.targetTurnId].y,
      width: 10,
      height: 10,
    };
    if (line.sourceMarker && quoteCoords[line.sourceTurnId]) {
      const sourceQuoteCoords = quoteCoords[line.sourceTurnId].find(
        (quote) => quote.id == line.sourceMarker
      );
      if (sourceQuoteCoords) {
        // если есть такая цитаты, то привязать к ней вместо шага
        sourceCoords = {
          left: turnsDictionary[line.sourceTurnId].x + sourceQuoteCoords.left,
          top: turnsDictionary[line.sourceTurnId].y + sourceQuoteCoords.top,
          width: sourceQuoteCoords.width,
          height: sourceQuoteCoords.height,
        };
      }
    }
    if (line.targetMarker && quoteCoords[line.targetTurnId]) {
      const targetQuoteCoords = quoteCoords[line.targetTurnId].find(
        (quote) => quote.id == line.targetMarker
      );
      if (targetQuoteCoords) {
        targetCoords = {
          left: turnsDictionary[line.targetTurnId].x + targetQuoteCoords.left,
          top: turnsDictionary[line.targetTurnId].y + targetQuoteCoords.top,
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
      if (!lineEnds[line.sourceMarker]) {
        lineEnds[line.sourceMarker] = {
          quoteId: line.sourceMarker,
          lines: [],
        };
      }
      lineEnds[line.sourceMarker].lines.push(line);
    }
    if (line.targetMarker) {
      if (!lineEnds[line.targetMarker]) {
        lineEnds[line.targetMarker] = {
          quoteId: line.targetMarker,
          lines: [],
        };
      }
      lineEnds[line.targetMarker].lines.push(line);
    }
  }
  return lineEnds;
};
