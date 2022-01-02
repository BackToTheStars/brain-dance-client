// @learn Next.js сам везде добавляет import React, в отличие от create-react-app
import { useEffect, useState } from 'react';
import { useTurnsCollectionContext } from '../TurnsCollectionContext';
import { useUserContext } from '../UserContext';

export const useQuotes = () => {
  const [preparedLines, setPreparedLines] = useState([]);

  const { activeQuote, lineEnds, quotesInfo, pictureQuotesInfo } =
    useTurnsCollectionContext();

  const {
    request,
    info: { hash },
  } = useUserContext();

  useEffect(() => {
    const clickedQuoteInfo = !!activeQuote
      ? lineEnds[`${activeQuote.turnId}_${activeQuote.quoteId}`]
      : null;
    const lines = clickedQuoteInfo ? clickedQuoteInfo.lines : [];

    const preparedLines = lines.map((line) => {
      let turnIdOutOfScreen = null;
      let sourceQuoteInfo = null;
      let targetQuoteInfo = null;

      if (!!quotesInfo[line.sourceTurnId]) {
        sourceQuoteInfo = quotesInfo[line.sourceTurnId].find(
          (quoteInfo) => line.sourceMarker === quoteInfo.quoteId
        );
      }
      if (!!pictureQuotesInfo[line.sourceTurnId] && !sourceQuoteInfo) {
        sourceQuoteInfo = pictureQuotesInfo[line.sourceTurnId].find(
          (pictureQuotesInfo) => line.sourceMarker === pictureQuotesInfo.quoteId
        );
      }
      if (!sourceQuoteInfo) {
        sourceQuoteInfo = {};
        turnIdOutOfScreen = line.sourceTurnId;
      }

      if (!!quotesInfo[line.targetTurnId]) {
        targetQuoteInfo = quotesInfo[line.targetTurnId].find(
          (quoteInfo) => line.targetMarker === quoteInfo.quoteId
        );
      }
      if (!!pictureQuotesInfo[line.targetTurnId] && !targetQuoteInfo) {
        targetQuoteInfo = pictureQuotesInfo[line.targetTurnId].find(
          (pictureQuotesInfo) => line.targetMarker === pictureQuotesInfo.quoteId
        );
      }
      if (!targetQuoteInfo) {
        targetQuoteInfo = {};
        turnIdOutOfScreen = line.targetTurnId;
      }

      return { ...line, sourceQuoteInfo, targetQuoteInfo, turnIdOutOfScreen };
    });
    setPreparedLines(preparedLines);
    const turnIdsOutOfScreen = preparedLines
      .filter((line) => !!line.turnIdOutOfScreen)
      .map((line) => line.turnIdOutOfScreen);

    if (!!turnIdsOutOfScreen.length) {
      request(
        `turns?hash=${hash}&turnIds=${turnIdsOutOfScreen.join(',')}`
      ).then((data) => {
        console.log(data);
        setPreparedLines(
          preparedLines.map((line) => {
            if (!!line.turnIdOutOfScreen) {
              // загружаем цитаты хода который не видно в области видимости
              const turnOutOfScreen = data.items.find(
                (turn) => turn._id === line.turnIdOutOfScreen
              );
              if (!Object.keys(line.sourceQuoteInfo).length) {
                return {
                  ...line,
                  sourceQuoteInfo: turnOutOfScreen.quotes.find(
                    (quote) => line.sourceMarker === quote.id
                  ),
                };
              }
              if (!Object.keys(line.targetQuoteInfo).length) {
                return {
                  ...line,
                  targetQuoteInfo: turnOutOfScreen.quotes.find(
                    (quote) => line.targetMarker === quote.id
                  ),
                };
              }
            } else return line;
          })
        );
      });
    }
    // console.log(turnIdsOutOfScreen);
  }, [activeQuote, lineEnds]);

  return { preparedLines };
};
